/**
 * Creates demo auth users + populated profiles, connections, messages,
 * notifications, enrollments and WhatsApp log examples.
 *
 * Run with:  node supabase/seed-users.mjs
 * Requires:  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 *            (service role key is NEVER used in the frontend — seed script only).
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

const DEMO_USERS = [
  { email: 'aarav.mehta@demo.igca.app', full_name: 'Aarav Mehta', username: 'aarav_mehta', account_type: 'founder', headline: 'Founder, Fintech Infrastructure', company_name: 'LedgerBridge' },
  { email: 'priya.nair@demo.igca.app', full_name: 'Priya Nair', username: 'priya_nair', account_type: 'investor', headline: 'Partner, Growth Capital', company_name: 'Northstar Partners' },
  { email: 'james.whitfield@demo.igca.app', full_name: 'James Whitfield', username: 'james_whitfield', account_type: 'advisor', headline: 'M&A Advisor', company_name: 'Whitfield & Co' },
  { email: 'sara.al.mansoori@demo.igca.app', full_name: 'Sara Al Mansoori', username: 'sara_almansoori', account_type: 'business_owner', headline: 'CEO, Regional Logistics Group', company_name: 'Meridian Logistics' },
  { email: 'daniel.oyelaran@demo.igca.app', full_name: 'Daniel Oyelaran', username: 'daniel_oyelaran', account_type: 'professional', headline: 'Director of Strategy', company_name: 'Continental Health Group' },
  { email: 'wei.zhang@demo.igca.app', full_name: 'Wei Zhang', username: 'wei_zhang', account_type: 'industry_expert', headline: 'Renewable Energy Policy Expert', company_name: 'Apex Energy Advisory' },
  { email: 'meera.krishnan@demo.igca.app', full_name: 'Meera Krishnan', username: 'meera_krishnan', account_type: 'professional', headline: 'VP Operations', company_name: 'Vantage Retail Co' },
  { email: 'thomas.becker@demo.igca.app', full_name: 'Thomas Becker', username: 'thomas_becker', account_type: 'investor', headline: 'Principal, Private Credit', company_name: 'Becker Capital' },
  { email: 'fatima.hassan@demo.igca.app', full_name: 'Fatima Hassan', username: 'fatima_hassan', account_type: 'founder', headline: 'Founder & CEO', company_name: 'Nomad Health Tech' },
  { email: 'ravi.subramaniam@demo.igca.app', full_name: 'Ravi Subramaniam', username: 'ravi_s', account_type: 'advisor', headline: 'Manufacturing Strategy Advisor', company_name: 'Subramaniam Consulting' },
  { email: 'lena.fischer@demo.igca.app', full_name: 'Lena Fischer', username: 'lena_fischer', account_type: 'professional', headline: 'Head of ESG', company_name: 'Fischer Industrial Group' },
  { email: 'omar.saeed@demo.igca.app', full_name: 'Omar Saeed', username: 'omar_saeed', account_type: 'business_owner', headline: 'Managing Director', company_name: 'Saeed Trading House' },
  { email: 'grace.thompson@demo.igca.app', full_name: 'Grace Thompson', username: 'grace_thompson', account_type: 'student', headline: 'MBA Candidate', company_name: null },
  { email: 'arjun.kapoor@demo.igca.app', full_name: 'Arjun Kapoor', username: 'arjun_kapoor', account_type: 'founder', headline: 'Co-founder, Supply Chain Tech', company_name: 'RouteWise' },
  { email: 'natasha.ivanova@demo.igca.app', full_name: 'Natasha Ivanova', username: 'natasha_ivanova', account_type: 'investor', headline: 'Investment Director', company_name: 'Ivanova Ventures' }
]

const DEMO_PASSWORD = 'IgcaDemo!2026'

async function run() {
  const created = []
  for (const u of DEMO_USERS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, username: u.username, account_type: u.account_type }
    })
    if (error) { console.error('user create failed', u.email, error.message); continue }
    created.push({ id: data.user.id, ...u })
    console.log('created', u.email)
  }

  // Enrich profiles created by the on_auth_user_created trigger
  for (const u of created) {
    await admin.from('profiles').update({
      headline: u.headline,
      company_name: u.company_name,
      bio: `${u.headline} focused on cross-border opportunities and practical, research-backed decision making.`,
      location: 'Available on request'
    }).eq('id', u.id)
  }

  // A handful of connections + accepted requests
  for (let i = 0; i < created.length - 1; i += 3) {
    const a = created[i], b = created[i + 1]
    if (!a || !b) continue
    const { data: req } = await admin.from('connection_requests').insert({
      sender_id: a.id, receiver_id: b.id, status: 'accepted', responded_at: new Date().toISOString()
    }).select().single()
    if (req) console.log('connected', a.username, '<->', b.username)
  }

  // A sample conversation + messages between the first two users
  if (created[0] && created[1]) {
    const { data: convo } = await admin.from('conversations').insert({}).select().single()
    await admin.from('conversation_members').insert([
      { conversation_id: convo.id, user_id: created[0].id },
      { conversation_id: convo.id, user_id: created[1].id }
    ])
    await admin.from('messages').insert([
      { conversation_id: convo.id, sender_id: created[0].id, content: 'Saw the India fintech snapshot you shared — great read.' },
      { conversation_id: convo.id, sender_id: created[1].id, content: 'Glad it was useful. Worth a call on the SME lending angle?' }
    ])
  }

  // Sample notifications
  for (const u of created.slice(0, 5)) {
    await admin.from('notifications').insert({
      user_id: u.id, type: 'research_published', title: 'New research published',
      body: 'A new IGCA research item matching your industry is now available.', link: '/learn/research'
    })
  }

  // Sample WhatsApp preference + delivery log
  const { data: research } = await admin.from('research_snapshots').select('id').limit(1).single()
  for (const u of created.slice(0, 4)) {
    await admin.from('whatsapp_preferences').update({
      phone_number: '+1555010' + String(100 + created.indexOf(u)),
      opted_in: true
    }).eq('user_id', u.id)

    if (research) {
      const { data: wm } = await admin.from('whatsapp_messages').insert({
        user_id: u.id, category: 'research',
        payload: { snapshot_id: research.id, headline: 'New IGCA research available' },
        status: 'delivered'
      }).select().single()
      if (wm) {
        await admin.from('whatsapp_delivery_logs').insert([
          { whatsapp_message_id: wm.id, status: 'queued', detail: 'Queued for delivery' },
          { whatsapp_message_id: wm.id, status: 'sent', detail: 'Sent via WhatsApp Business API' },
          { whatsapp_message_id: wm.id, status: 'delivered', detail: 'Delivery confirmed' }
        ])
      }
    }
  }

  // Course enrollments in varied states
  const { data: courses } = await admin.from('courses').select('id').limit(4)
  if (courses) {
    created.slice(0, 6).forEach(async (u, idx) => {
      const course = courses[idx % courses.length]
      const status = idx % 3 === 0 ? 'completed' : idx % 3 === 1 ? 'in_progress' : 'enrolled'
      await admin.from('course_enrollments').insert({
        user_id: u.id, course_id: course.id, status,
        progress_percent: status === 'completed' ? 100 : status === 'in_progress' ? 45 : 0,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      if (status === 'completed') {
        await admin.from('certifications').insert({
          user_id: u.id, course_id: course.id, title: 'IGCA Certified Professional',
          credential_code: 'IGCA-' + Math.random().toString(36).slice(2, 9).toUpperCase()
        })
      }
    })
  }

  console.log(`\nDone. Demo login password for all seeded users: ${DEMO_PASSWORD}`)
}

run()
