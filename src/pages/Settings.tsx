import { useEffect, useState } from 'react'
import { Lock, Bell, MessageCircle, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingGrid } from '@/components/ui/States'
import type { WhatsAppPreferences } from '@/types/database'

export default function Settings() {
  const { profile } = useAuth()
  const [wa, setWa] = useState<WhatsAppPreferences | null>(null)
  const [notif, setNotif] = useState<{ email_enabled: boolean; push_enabled: boolean } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (!profile) return
    supabase.from('whatsapp_preferences').select('*').eq('user_id', profile.id).single().then(({ data }) => setWa(data ?? null))
    supabase.from('notification_preferences').select('*').eq('user_id', profile.id).single().then(({ data }) => setNotif(data ?? { email_enabled: true, push_enabled: true }))
  }, [profile])

  function flash() { setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1500) }

  async function saveWa(patch: Partial<WhatsAppPreferences>) {
    if (!profile || !wa) return
    const next = { ...wa, ...patch }
    setWa(next)
    await supabase.from('whatsapp_preferences').update(patch).eq('user_id', profile.id)
    flash()
  }

  async function saveNotif(patch: Partial<{ email_enabled: boolean; push_enabled: boolean }>) {
    if (!profile || !notif) return
    const next = { ...notif, ...patch }
    setNotif(next)
    await supabase.from('notification_preferences').update(patch).eq('user_id', profile.id)
    flash()
  }

  async function updatePassword() {
    if (!newPassword) return
    await supabase.auth.updateUser({ password: newPassword })
    setNewPassword('')
    flash()
  }

  if (!profile) return <div className="container-app py-8"><LoadingGrid count={1} /></div>

  return (
    <div className="container-app py-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Settings</h1>
        {savedFlash && <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600"><Check className="h-4 w-4" /> Saved</span>}
      </div>

      <section className="card p-6">
        <h2 className="font-display text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2"><Lock className="h-5 w-5 text-ink-700/60" /> Security</h2>
        <div className="flex gap-2">
          <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input flex-1" />
          <button onClick={updatePassword} className="btn-secondary shrink-0">Update</button>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-ink-700/60" /> Notification Preferences</h2>
        <Toggle label="Email notifications" checked={notif?.email_enabled ?? true} onChange={(v) => saveNotif({ email_enabled: v })} />
        <Toggle label="Push notifications" checked={notif?.push_enabled ?? true} onChange={(v) => saveNotif({ push_enabled: v })} />
        <p className="text-xs text-ink-700/50 mt-3">Connection requests always appear in your in-app Notifications regardless of these settings.</p>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#25D366]" /> WhatsApp Preferences</h2>
        <p className="text-sm text-ink-700/60 mb-4">Control which valuable updates IGCA may send you on WhatsApp. Connection requests and routine activity are never sent here.</p>

        <label className="block mb-4">
          <span className="block text-sm font-semibold text-ink-800 mb-1.5">WhatsApp number</span>
          <input className="input" placeholder="+1 555 000 0000" value={wa?.phone_number ?? ''}
            onChange={(e) => setWa(wa ? { ...wa, phone_number: e.target.value } : wa)}
            onBlur={(e) => saveWa({ phone_number: e.target.value })} />
        </label>

        <Toggle label="Enable WhatsApp updates" checked={wa?.opted_in ?? false} onChange={(v) => saveWa({ opted_in: v })} />
        <div className={wa?.opted_in ? '' : 'opacity-40 pointer-events-none'}>
          <Toggle label="Important IGCA research" checked={wa?.allow_research_updates ?? true} onChange={(v) => saveWa({ allow_research_updates: v })} />
          <Toggle label="Snapshot shares I initiate" checked={wa?.allow_snapshot_shares ?? true} onChange={(v) => saveWa({ allow_snapshot_shares: v })} />
          <Toggle label="Learn & Grow updates" checked={wa?.allow_learning_updates ?? false} onChange={(v) => saveWa({ allow_learning_updates: v })} />
          <Toggle label="Important account updates" checked={wa?.allow_account_updates ?? true} onChange={(v) => saveWa({ allow_account_updates: v })} />
        </div>
      </section>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-ink-900/5 last:border-0">
      <span className="text-sm text-ink-800">{label}</span>
      <button onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-brand-600' : 'bg-ink-900/15'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
