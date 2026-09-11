import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Share2, ArrowUpRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LoadingGrid, EmptyState, ErrorState } from '@/components/ui/States'
import type { ResearchSnapshot, ResearchItem } from '@/types/database'

export default function SnapshotsListing() {
  const [rows, setRows] = useState<(ResearchSnapshot & { research?: ResearchItem })[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null); setRows(null)
    const { data, error } = await supabase.from('research_snapshots').select('*, research:research_items(*)').order('created_at', { ascending: false }).limit(30)
    if (error) { setError(error.message); return }
    setRows((data as unknown as (ResearchSnapshot & { research: ResearchItem })[]) ?? [])
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container-app py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Research Snapshots</h1>
        <p className="text-ink-700/70 mt-1">Concise, client-ready summaries — perfect for sharing on WhatsApp.</p>
      </div>

      {error ? <ErrorState message={error} onRetry={load} /> : rows === null ? <LoadingGrid count={6} /> : rows.length === 0 ? (
        <EmptyState icon={Share2} title="No snapshots yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((s) => (
            <Link key={s.id} to={`/learn/snapshots/${s.id}`} className="card p-4 flex flex-col hover:shadow-lg transition-shadow">
              <span className="chip mb-2 w-fit">Snapshot</span>
              <h3 className="font-display font-semibold text-ink-900 mb-1.5 line-clamp-2">{s.headline}</h3>
              <p className="text-sm text-ink-700/70 line-clamp-2 mb-3 flex-1">{s.executive_summary}</p>
              <span className="flex items-center gap-0.5 text-sm font-semibold text-brand-600">
                View & Share <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
