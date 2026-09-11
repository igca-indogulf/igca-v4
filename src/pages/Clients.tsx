import { useEffect, useState } from 'react'
import { Search, Briefcase, UserPlus, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingGrid, EmptyState, ErrorState } from '@/components/ui/States'
import { Avatar } from '@/components/ui/Avatar'
import type { Profile, Industry } from '@/types/database'

export default function Clients() {
  const { profile } = useAuth()
  const [query, setQuery] = useState('')
  const [industryId, setIndustryId] = useState('')
  const [industries, setIndustries] = useState<Industry[]>([])
  const [people, setPeople] = useState<Profile[] | null>(null)
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { supabase.from('industries').select('*').order('name').then(({ data }) => setIndustries(data ?? [])) }, [])

  async function load() {
    setError(null); setPeople(null)
    let q = supabase.from('profiles').select('*').neq('id', profile?.id ?? '')
      .in('account_type', ['business_owner', 'founder', 'professional']).limit(24)
    if (query.trim()) q = q.ilike('full_name', `%${query.trim()}%`)
    if (industryId) q = q.eq('industry_id', industryId)
    const { data, error } = await q
    if (error) { setError(error.message); return }
    setPeople(data ?? [])

    const { data: outgoing } = await supabase.from('connection_requests').select('receiver_id').eq('sender_id', profile?.id)
    setSentTo(new Set(outgoing?.map((r) => r.receiver_id) ?? []))
  }

  useEffect(() => { if (profile) load() }, [profile, industryId])

  async function sendRequest(receiverId: string) {
    if (!profile) return
    setSentTo((s) => new Set(s).add(receiverId))
    await supabase.from('connection_requests').insert({ sender_id: profile.id, receiver_id: receiverId })
  }

  return (
    <div className="container-app py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Find New Clients</h1>
        <p className="text-ink-700/70 mt-1">Discover businesses and professionals who could become clients or partners.</p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-700/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search by name…" className="input pl-9" />
        </div>
        <select value={industryId} onChange={(e) => setIndustryId(e.target.value)} className="input sm:w-56">
          <option value="">All industries</option>
          {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>

      {error ? <ErrorState message={error} onRetry={load} /> : people === null ? <LoadingGrid /> : people.length === 0 ? (
        <EmptyState icon={Briefcase} title="No matches found" description="Try a different industry filter or search term." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((p) => (
            <div key={p.id} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Avatar url={p.avatar_url} name={p.full_name} size={48} />
                <div>
                  <p className="font-semibold text-ink-900">{p.full_name}</p>
                  <p className="text-xs text-ink-700/60 capitalize">{p.account_type.replace('_', ' ')}</p>
                </div>
              </div>
              {p.headline && <p className="text-sm text-ink-700/70">{p.headline}</p>}
              {p.company_name && <p className="text-xs text-ink-700/50">{p.company_name}</p>}
              {sentTo.has(p.id) ? (
                <span className="btn-secondary mt-2 !cursor-default text-ink-700/50"><Clock className="h-4 w-4" /> Request sent</span>
              ) : (
                <button onClick={() => sendRequest(p.id)} className="btn-primary mt-2"><UserPlus className="h-4 w-4" /> Connect</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
