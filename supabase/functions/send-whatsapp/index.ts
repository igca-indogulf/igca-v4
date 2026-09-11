// Supabase Edge Function: send-whatsapp
// Deploy:  supabase functions deploy send-whatsapp
// Secrets: supabase secrets set WHATSAPP_TOKEN=... WHATSAPP_PHONE_ID=... SUPABASE_SERVICE_ROLE_KEY=...
//
// This function is the ONLY place WhatsApp credentials are used.
// It is invoked server-side (e.g. by a DB webhook/cron on whatsapp_messages
// rows with status='pending'), never directly from the frontend.
//
// Eligibility rules enforced here (never trust the caller):
//   1. category must be one of: research, snapshot_share, learning, account
//   2. user must be opted_in AND have the matching allow_* preference true
//   3. connection_request / connection_accepted events are NEVER sent here —
//      those stay inside in-app notifications only (product rule #7).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')!
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID')!

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

type Category = 'research' | 'snapshot_share' | 'learning' | 'account'

const PREFERENCE_COLUMN: Record<Category, string> = {
  research: 'allow_research_updates',
  snapshot_share: 'allow_snapshot_shares',
  learning: 'allow_learning_updates',
  account: 'allow_account_updates'
}

async function isEligible(userId: string, category: Category) {
  const { data: prefs } = await admin
    .from('whatsapp_preferences')
    .select('opted_in, phone_number, ' + PREFERENCE_COLUMN[category])
    .eq('user_id', userId)
    .single()

  if (!prefs || !prefs.opted_in || !prefs.phone_number) return { eligible: false as const }
  // deno-lint-ignore no-explicit-any
  const allowed = (prefs as any)[PREFERENCE_COLUMN[category]]
  if (!allowed) return { eligible: false as const }
  return { eligible: true as const, phone: prefs.phone_number as string }
}

function buildMessageText(category: Category, payload: Record<string, unknown>) {
  if (category === 'snapshot_share') {
    return `*IGCA Research Snapshot*\n\n${payload.headline}\n\n${payload.summary}\n\nRead more: ${payload.link}\n\n_Shared via IGCA_`
  }
  if (category === 'research') {
    return `*New IGCA Research*\n\n${payload.headline}\n\n${payload.summary ?? ''}\n\nRead more: ${payload.link ?? ''}`
  }
  if (category === 'learning') {
    return `*IGCA Learn & Grow Update*\n\n${payload.title}\n\n${payload.link ?? ''}`
  }
  return `*IGCA Update*\n\n${payload.title ?? 'You have an update on IGCA.'}`
}

async function sendViaWhatsAppApi(toPhone: string, text: string) {
  const res = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone,
      type: 'text',
      text: { body: text }
    })
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`WhatsApp API error ${res.status}: ${body}`)
  }
  return res.json()
}

Deno.serve(async (req) => {
  try {
    const { whatsapp_message_id } = await req.json()
    if (!whatsapp_message_id) {
      return new Response(JSON.stringify({ error: 'whatsapp_message_id required' }), { status: 400 })
    }

    const { data: msg, error } = await admin
      .from('whatsapp_messages')
      .select('*')
      .eq('id', whatsapp_message_id)
      .single()
    if (error || !msg) return new Response(JSON.stringify({ error: 'message not found' }), { status: 404 })

    const category = msg.category as Category
    const { eligible, phone } = await isEligible(msg.user_id, category)

    if (!eligible) {
      await admin.from('whatsapp_messages').update({ status: 'failed', last_error: 'not eligible / not opted in' }).eq('id', msg.id)
      await admin.from('whatsapp_delivery_logs').insert({ whatsapp_message_id: msg.id, status: 'failed', detail: 'Recipient not eligible or not opted in' })
      return new Response(JSON.stringify({ status: 'skipped_not_eligible' }), { status: 200 })
    }

    await admin.from('whatsapp_messages').update({ status: 'queued' }).eq('id', msg.id)
    await admin.from('whatsapp_delivery_logs').insert({ whatsapp_message_id: msg.id, status: 'queued', detail: 'Queued for delivery' })

    try {
      const text = buildMessageText(category, msg.payload ?? {})
      await sendViaWhatsAppApi(phone!, text)
      await admin.from('whatsapp_messages').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', msg.id)
      await admin.from('whatsapp_delivery_logs').insert({ whatsapp_message_id: msg.id, status: 'sent', detail: 'Sent via WhatsApp Business API' })
      return new Response(JSON.stringify({ status: 'sent' }), { status: 200 })
    } catch (sendErr) {
      const attempts = (msg.attempts ?? 0) + 1
      const nextStatus = attempts < 3 ? 'retry' : 'failed'
      await admin.from('whatsapp_messages').update({
        status: nextStatus, attempts, last_error: String(sendErr)
      }).eq('id', msg.id)
      await admin.from('whatsapp_delivery_logs').insert({
        whatsapp_message_id: msg.id, status: nextStatus, detail: String(sendErr)
      })
      return new Response(JSON.stringify({ status: nextStatus, error: String(sendErr) }), { status: 200 })
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
