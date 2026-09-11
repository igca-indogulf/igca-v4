import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ResearchCard } from '@/components/research/ResearchCard'
import { LoadingGrid, EmptyState, ErrorState } from '@/components/ui/States'
import type { ResearchItem, Industry, Country, Topic } from '@/types/database'

export default function ResearchListing() {
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<ResearchItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [industries, setIndustries] = useState<Industry[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 12

  const [query, setQuery] = useState('')
  const [industryId, setIndustryId] = useState('')
  const [countryId, setCountryId] = useState('')
  const [topicId, setTopicId] = useState('')
  const [sort, setSort] = useState<'latest' | 'featured'>('latest')

  useEffect(() => {
    supabase.from('industries').select('*').order('name').then(({ data }) => setIndustries(data ?? []))
    supabase.from('countries').select('*').order('name').then(({ data }) => setCountries(data ?? []))
    supabase.from('topics').select('*').order('name').then(({ data }) => setTopics(data ?? []))
  }, [])

  async function load(targetPage = 0) {
    setError(null)
    if (targetPage === 0) setItems(null)
    let q = supabase.from('research_items').select('*').eq('published', true)
    if (query.trim()) q = q.ilike('title', `%${query.trim()}%`)
    if (industryId) q = q.eq('industry_id', industryId)
    if (countryId) q = q.eq('country_id', countryId)
    if (topicId) q = q.eq('topic_id', topicId)
    q = sort === 'featured' ? q.order('featured', { ascending: false }).order('published_at', { ascending: false }) : q.order('published_at', { ascending: false })

    const from = targetPage * PAGE_SIZE
    const { data, error } = await q.range(from, from + PAGE_SIZE)
    if (error) { setError(error.message); return }
    const rows = data ?? []
    setHasMore(rows.length > PAGE_SIZE)
    const pageRows = rows.slice(0, PAGE_SIZE)
    setItems((prev) => (targetPage === 0 ? pageRows : [...(prev ?? []), ...pageRows]))
    setPage(targetPage)
  }

  useEffect(() => {
    const scope = searchParams.get('scope')
    if (scope) setSort('latest')
    load(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industryId, countryId, topicId, sort])

  return (
    <div className="container-app py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">IGCA Research</h1>
        <p className="text-ink-700/70 mt-1">Search and filter research by industry, country and topic.</p>
      </div>

      <div className="card p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-700/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search research titles…"
            className="input pl-9"
          />
        </div>
        <select value={industryId} onChange={(e) => setIndustryId(e.target.value)} className="input lg:w-48">
          <option value="">All industries</option>
          {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <select value={countryId} onChange={(e) => setCountryId(e.target.value)} className="input lg:w-48">
          <option value="">All countries</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className="input lg:w-48">
          <option value="">All topics</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as 'latest' | 'featured')} className="input lg:w-40">
          <option value="latest">Latest</option>
          <option value="featured">Featured</option>
        </select>
      </div>

      {error ? <ErrorState message={error} onRetry={() => load(0)} /> : items === null ? <LoadingGrid count={8} /> : items.length === 0 ? (
        <EmptyState icon={BookOpen} title="No research matches your filters" description="Try broadening your search or clearing filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => <ResearchCard key={item.id} item={item} />)}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button onClick={() => load(page + 1)} className="btn-secondary">Load more</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
