import { supabase } from '@/lib/supabase'

interface ShareSnapshotArgs {
  userId: string
  snapshotId: string
  headline: string
  summary: string
  link: string
}

/**
 * User-initiated share of a Research Snapshot via WhatsApp.
 * This is DISTINCT from automated WhatsApp notifications: the user
 * explicitly chose to share this one snapshot with a contact.
 * We log the share_event and queue a whatsapp_messages row; actual
 * delivery/eligibility enforcement happens server-side in the
 * send-whatsapp Edge Function (never trust the client for eligibility).
 */
export async function shareSnapshotOnWhatsApp({ userId, snapshotId, headline, summary, link }: ShareSnapshotArgs) {
  await supabase.from('share_events').insert({ user_id: userId, snapshot_id: snapshotId, channel: 'whatsapp' })

  const { data: msg, error } = await supabase.from('whatsapp_messages').insert({
    user_id: userId,
    category: 'snapshot_share',
    payload: { snapshot_id: snapshotId, headline, summary, link },
    status: 'pending'
  }).select().single()

  return { message: msg, error }
}

export async function recordCopyOrLinkShare(userId: string, snapshotId: string, channel: 'copy' | 'link') {
  await supabase.from('share_events').insert({ user_id: userId, snapshot_id: snapshotId, channel })
}

export function buildWhatsAppWebUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
