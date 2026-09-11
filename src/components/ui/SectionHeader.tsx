import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function SectionHeader({ title, subtitle, showAllHref }: { title: string; subtitle?: string; showAllHref?: string }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
        {subtitle && <p className="text-sm text-ink-700/60 mt-0.5">{subtitle}</p>}
      </div>
      {showAllHref && (
        <Link to={showAllHref} className="btn-ghost shrink-0">
          Show All <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
