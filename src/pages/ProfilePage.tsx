import { useEffect, useState } from 'react'
import { Award, Save, X, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingGrid } from '@/components/ui/States'
import { Avatar } from '@/components/ui/Avatar'
import type { Industry, Country, Certification, AccountType } from '@/types/database'

const ACCOUNT_TYPES: AccountType[] = ['investor', 'founder', 'professional', 'business_owner', 'advisor', 'industry_expert', 'student', 'other']

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [certs, setCerts] = useState<Certification[]>([])
  const [form, setForm] = useState(profile)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    supabase.from('industries').select('*').order('name').then(({ data }) => setIndustries(data ?? []))
    supabase.from('countries').select('*').order('name').then(({ data }) => setCountries(data ?? []))
    if (profile) supabase.from('certifications').select('*').eq('user_id', profile.id).then(({ data }) => setCerts(data ?? []))
  }, [profile])

  useEffect(() => { setForm(profile) }, [profile])

  if (!profile || !form) return <div className="container-app py-8"><LoadingGrid count={1} /></div>

  async function handleSave() {
    if (!form) return
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: form.full_name, headline: form.headline, bio: form.bio, location: form.location,
      industry_id: form.industry_id, country_id: form.country_id, company_name: form.company_name,
      website: form.website, phone: form.phone, account_type: form.account_type
    }).eq('id', form.id)
    await refreshProfile()
    setSaving(false)
    setEditing(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id)
      await refreshProfile()
    }
    setUploading(false)
  }

  return (
    <div className="container-app py-8 max-w-2xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar url={profile.avatar_url} name={profile.full_name} size={64} />
              <label className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center cursor-pointer">
                <Camera className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-ink-900">{profile.full_name}</h1>
              <p className="text-sm text-ink-700/60">@{profile.username}</p>
            </div>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary">Edit Profile</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setForm(profile) }} className="btn-secondary !px-3"><X className="h-4 w-4" /></button>
              <button onClick={handleSave} disabled={saving} className="btn-primary !px-3"><Save className="h-4 w-4" /></button>
            </div>
          )}
        </div>

        {!editing ? (
          <div className="space-y-3 text-sm">
            {profile.headline && <p className="font-medium text-ink-900">{profile.headline}</p>}
            {profile.bio && <p className="text-ink-700/70">{profile.bio}</p>}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Info label="Account type" value={profile.account_type.replace('_', ' ')} />
              <Info label="Company" value={profile.company_name ?? '—'} />
              <Info label="Location" value={profile.location ?? '—'} />
              <Info label="Website" value={profile.website ?? '—'} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input className="input" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <input className="input" placeholder="Headline" value={form.headline ?? ''} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
            <textarea className="input" placeholder="Bio" rows={3} value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <select className="input" value={form.account_type} onChange={(e) => setForm({ ...form, account_type: e.target.value as AccountType })}>
              {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.industry_id ?? ''} onChange={(e) => setForm({ ...form, industry_id: e.target.value || null })}>
                <option value="">Industry</option>
                {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <select className="input" value={form.country_id ?? ''} onChange={(e) => setForm({ ...form, country_id: e.target.value || null })}>
                <option value="">Country</option>
                {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <input className="input" placeholder="Company name" value={form.company_name ?? ''} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Location" value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <input className="input" placeholder="Website" value={form.website ?? ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <input className="input" placeholder="Phone" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-gold-500" /> Certifications
        </h2>
        {certs.length === 0 ? (
          <p className="text-sm text-ink-700/60">Complete a certification-eligible course to earn your first credential.</p>
        ) : (
          <div className="space-y-2">
            {certs.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-50">
                <div>
                  <p className="font-medium text-ink-900 text-sm">{c.title}</p>
                  <p className="text-xs text-ink-700/50">Issued {new Date(c.issued_at).toLocaleDateString()} · {c.credential_code}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-700/50 uppercase font-semibold">{label}</p>
      <p className="text-ink-900 capitalize">{value}</p>
    </div>
  )
}
