import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus, Users, Check, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingGrid, EmptyState, ErrorState } from '@/components/ui/States'
import { Avatar } from '@/components/ui/Avatar'
import type { Profile, ConnectionRequest } from '@/types/database'

const TABS = [
  { value: 'discover', label: 'Discover' },
  { value: 'requests', label: 'Requests' },
  { value: 'connections', label: 'My Connections' }
] as const

export default function Network() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<(typeof TABS)[number]['value']>('discover')
  const [query, setQuery] = useState('')
  const [people, setPeople] = useState<Profile[] | null>(null)
  const [requests, setRequests] = useState<(ConnectionRequest & { sender?: Profile })[] | null>(null)
  const [connections, setConnections] = useState<Profile[] | null>(null)
  const [sentTo, setSentTo] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  async function loadDiscover() {
    setError(null); setPeople(null)
    let q = supabase.from('profiles').select('*').neq('id', profile?.id ?? '').limit(24)
    if (query.trim()) q = q.ilike('full_name', `%${query.trim()}%`)
    const { data, error } = await q
    if (error) { setError(error.message); return }
    setPeople(data ?? [])

    const { data: outgoing } = await supabase.from('connection_requests').select('receiver_id').eq('sender_id', profile?.id)
    setSentTo(new Set(outgoing?.map((r) => r.receiver_id) ?? []))
  }

  async function loadRequests() {
    setError(null); setRequests(null)
    const { data, error } = await supabase.from('connection_requests')
      .select('*, sender:profiles!connection_requests_sender_id_fkey(*)')
      .eq('receiver_id', profile?.id).eq('status', 'pending')
    if (error) { setError(error.message); return }
    setRequests((data as unknown as (ConnectionRequest & { sender: Profile })[]) ?? [])
  }

  async function loadConnections() {
    setError(null); setConnections(null)
    const { data, error } = await supabase.from('connections').select('*').or(`user_a.eq.${profile?.id},user_b.eq.${profile?.id}`)
    if (error) { setError(error.message); return }
    const otherIds = (data ?? []).map((c) => (c.user_a === profile?.id ? c.user_b : c.user_a))
    if (otherIds.length === 0) { setConnections([]); return }
    const { data: profs } = await supabase.from('profiles').select('*').in('id', otherIds)
    setConnections(profs ?? [])
  }

  useEffect(() => {
    if (!profile) return
    if (tab === 'discover') loadDiscover()
    if (tab === 'requests') loadRequests()
    if (tab === 'connections') loadConnections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, profile])

  async function sendRequest(receiverId: string) {
    if (!profile) return
    setSentTo((s) => new Set(s).add(receiverId))
    await supabase.from('connection_requests').insert({ sender_id: profile.id, receiver_id: receiverId })
  }

  async function respond(reqId: string, status: 'accepted' | 'rejected') {
    await supabase.from('connection_requests').update({ status, responded_at: new Date().toISOString() }).eq('id', reqId)
    setRequests((r) => r?.filter((x) => x.id !== reqId) ?? null)
  }

  return (
    <div className="container-app py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Connect & Network</h1>
        <p className="text-ink-700/70 mt-1">Build relationships with relevant professionals and businesses.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === t.value ? 'bg-brand-600 text-white' : 'bg-white border border-ink-900/10 text-ink-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'discover' && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-700/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadDiscover()}
              placeholder="Search by name…" className="input pl-9" />
          </div>
          {error ? <ErrorState message={error} onRetry={loadDiscover} /> : people === null ? <LoadingGrid /> : people.length === 0 ? (
            <EmptyState icon={Users} title="No professionals found" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {people.map((p) => <PersonCard key={p.id} p={p} action={
                sentTo.has(p.id)
                  ? <span className="btn-secondary !cursor-default text-ink-700/50"><Clock className="h-4 w-4" /> Requested</span>
                  : <button onClick={() => sendRequest(p.id)} className="btn-primary"><UserPlus className="h-4 w-4" /> Connect</button>
              } />)}
            </div>
          )}
        </>
      )}

      {tab === 'requests' && (
        error ? <ErrorState message={error} onRetry={loadRequests} /> : requests === null ? <LoadingGrid /> : requests.length === 0 ? (
          <EmptyState icon={UserPlus} title="No pending requests" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((r) => r.sender && (
              <PersonCard key={r.id} p={r.sender} action={
                <div className="flex gap-2">
                  <button onClick={() => respond(r.id, 'accepted')} className="btn-primary !px-3"><Check className="h-4 w-4" /></button>
                  <button onClick={() => respond(r.id, 'rejected')} className="btn-secondary !px-3">✕</button>
                </div>
              } />
            ))}
          </div>
        )
      )}

      {tab === 'connections' && (
        error ? <ErrorState message={error} onRetry={loadConnections} /> : connections === null ? <LoadingGrid /> : connections.length === 0 ? (
          <EmptyState icon={Users} title="No connections yet" description="Discover professionals to start building your network." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((p) => <PersonCard key={p.id} p={p} action={<Link to="/messages" className="btn-secondary">Message</Link>} />)}
          </div>
        )
      )}
    </div>
  )
}

function PersonCard({ p, action }: { p: Profile; action: React.ReactNode }) {
  return (
    <div className="card p-4 flex flex-col items-center text-center gap-2">
      <Avatar url={p.avatar_url} name={p.full_name} size={56} />
      <div>
        <p className="font-semibold text-ink-900">{p.full_name}</p>
        {p.headline && <p className="text-sm text-ink-700/60">{p.headline}</p>}
        {p.company_name && <p className="text-xs text-ink-700/50">{p.company_name}</p>}
      </div>
      {action}
    </div>
  )
}
