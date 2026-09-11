import { useEffect, useState } from 'react'
import { PlayCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { VideoCard } from '@/components/learn/Cards'
import { LoadingGrid, EmptyState, ErrorState } from '@/components/ui/States'
import type { LearningVideo } from '@/types/database'

const TABS: { value: LearningVideo['category'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'industry', label: 'Industry' },
  { value: 'country', label: 'Country' },
  { value: 'network', label: 'Network' }
]

export default function VideosListing() {
  const [tab, setTab] = useState<LearningVideo['category'] | 'all'>('all')
  const [videos, setVideos] = useState<LearningVideo[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null); setVideos(null)
    let q = supabase.from('learning_videos').select('*').order('published_at', { ascending: false })
    if (tab !== 'all') q = q.eq('category', tab)
    const { data, error } = await q.limit(30)
    if (error) { setError(error.message); return }
    setVideos(data ?? [])
  }

  useEffect(() => { load() }, [tab])

  return (
    <div className="container-app py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Videos</h1>
        <p className="text-ink-700/70 mt-1">Short expert briefings across your industry, country and network.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === t.value ? 'bg-brand-600 text-white' : 'bg-white border border-ink-900/10 text-ink-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {error ? <ErrorState message={error} onRetry={load} /> : videos === null ? <LoadingGrid count={8} /> : videos.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No videos in this category yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  )
}
