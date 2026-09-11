import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, Clock, Share2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ResearchCard } from '@/components/research/ResearchCard'
import { LoadingGrid, ErrorState } from '@/components/ui/States'
import type { ResearchItem, ResearchHighlight, ResearchSnapshot } from '@/types/database'

export default function ResearchDetail() {
  const { slug } = useParams()
  const [item, setItem] = useState<ResearchItem | null>(null)
  const [highlights, setHighlights] = useState<ResearchHighlight[]>([])
  const [snapshot, setSnapshot] = useState<ResearchSnapshot | null>(null)
  const [related, setRelated] = useState<ResearchItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setError(null); setItem(null)
      const { data, error } = await supabase.from('research_items').select('*').eq('slug', slug).eq('published', true).single()
      if (error || !data) { setError('Research not found.'); return }
      setItem(data)

      const [{ data: hl }, { data: snap }, { data: rel }] = await Promise.all([
        supabase.from('research_highlights').select('*').eq('research_id', data.id).order('sort_order'),
        supabase.from('research_snapshots').select('*').eq('research_id', data.id).maybeSingle(),
        supabase.from('research_items').select('*').eq('published', true).eq('industry_id', data.industry_id).neq('id', data.id).limit(3)
      ])
      setHighlights(hl ?? [])
      setSnapshot(snap ?? null)
      setRelated(rel ?? [])
    }
    if (slug) load()
  }, [slug])

  if (error) return <div className="container-app py-8"><ErrorState message={error} /></div>
  if (!item) return <div className="container-app py-8"><LoadingGrid count={1} /></div>

  return (
    <div className="container-app py-8 max-w-3xl mx-auto">
      <Link to="/learn/research" className="btn-ghost mb-4"><ArrowLeft className="h-4 w-4" /> Back to Research</Link>

      <div className="h-56 rounded-2xl bg-gradient-to-br from-ink-900 to-brand-700 mb-6 flex items-center justify-center">
        <span className="font-display text-white/80 tracking-widest uppercase text-sm">IGCA Research</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-ink-700/60 mb-3">
        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(item.published_at).toLocaleDateString()}</span>
        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {item.reading_time} min read</span>
      </div>

      <h1 className="font-display text-3xl font-semibold text-ink-900 leading-tight mb-4">{item.title}</h1>
      <p className="text-lg text-ink-700/80 mb-6">{item.executive_summary}</p>

      {highlights.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {highlights.map((h) => (
            <div key={h.id} className="card p-4">
              {h.metric_value && <p className="font-display text-xl font-semibold text-brand-600">{h.metric_value}</p>}
              <p className="text-sm font-semibold text-ink-900 mt-1">{h.title}</p>
              <p className="text-xs text-ink-700/60 mt-0.5">{h.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="prose-custom space-y-4 text-ink-800 leading-relaxed mb-8">
        <p>{item.summary}</p>
        {snapshot?.conclusion && (
  <>
    <h3 className="font-display text-lg font-semibold text-ink-900 pt-2">Conclusion</h3>
    <p>{snapshot.conclusion}</p>
  </>
)}
        {item.source && <p className="text-sm text-ink-700/50 pt-2">Source: {item.source}</p>}
      </div>

      {snapshot && (
        <div className="card p-6 flex items-center justify-between mb-10">
          <div>
            <p className="font-semibold text-ink-900">Get the shareable snapshot</p>
            <p className="text-sm text-ink-700/60">A concise, client-ready version of this research.</p>
          </div>
          <Link to={`/learn/snapshots/${snapshot.id}`} className="btn-primary shrink-0">
            <Share2 className="h-4 w-4" /> View Snapshot
          </Link>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900 mb-4">Related Research</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => <ResearchCard key={r.id} item={r} />)}
          </div>
        </div>
      )}
    </div>
  )
}
