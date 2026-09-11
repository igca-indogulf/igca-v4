import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="h-28 bg-ink-900/5 rounded-xl mb-3" />
          <div className="h-3 bg-ink-900/10 rounded w-2/3 mb-2" />
          <div className="h-3 bg-ink-900/10 rounded w-full mb-1" />
          <div className="h-3 bg-ink-900/10 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon = Inbox, title, description
}: { icon?: LucideIcon; title: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="h-12 w-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-ink-700/60" />
      </div>
      <p className="font-semibold text-ink-900">{title}</p>
      {description && <p className="text-sm text-ink-700/70 mt-1 max-w-sm">{description}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <p className="font-semibold text-ink-900">Something went wrong</p>
      <p className="text-sm text-ink-700/70 mt-1">{message ?? 'Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  )
}
