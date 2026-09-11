import { Link } from 'react-router-dom'
import { Clock, ArrowUpRight } from 'lucide-react'
import type { ResearchItem } from '@/types/database'

export function ResearchCard({ item }: { item: ResearchItem & { category_name?: string } }) {
  return (
    <Link to={`/learn/research/${item.slug}`} className="card p-4 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="h-28 rounded-xl bg-gradient-to-br from-ink-900 to-brand-700 mb-3 flex items-center justify-center">
        <span className="font-display text-white/80 text-xs tracking-widest uppercase">IGCA Research</span>
      </div>
      {item.category_name && <span className="chip mb-2 w-fit">{item.category_name}</span>}
      <h3 className="font-display font-semibold text-ink-900 leading-snug mb-1.5 line-clamp-2">{item.title}</h3>
      <p className="text-sm text-ink-700/70 line-clamp-2 mb-3 flex-1">{item.summary}</p>
      <div className="flex items-center justify-between text-xs text-ink-700/60 pt-2 border-t border-ink-900/5">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {item.reading_time} min read</span>
        <span className="flex items-center gap-0.5 font-semibold text-brand-600">
          Read <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}
