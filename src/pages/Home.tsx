import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Lightbulb, Share2, GraduationCap, Users, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ResearchCard } from '@/components/research/ResearchCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { LoadingGrid, EmptyState } from '@/components/ui/States'
import type { ResearchItem } from '@/types/database'

const quickActions = [
  { label: 'Read Research', icon: BookOpen, to: '/learn/research' },
  { label: 'Explore Insights', icon: Lightbulb, to: '/learn' },
  { label: 'Continue Learning', icon: GraduationCap, to: '/learn/courses' },
  { label: 'Share Research', icon: Share2, to: '/learn/snapshots' }
]

export default function Home() {
  const { profile } = useAuth()
  const [featured, setFeatured] = useState<ResearchItem[] | null>(null)
  const [latest, setLatest] = useState<ResearchItem[] | null>(null)
  const [industryItems, setIndustryItems] = useState<ResearchItem[] | null>(null)
  const [countryItems, setCountryItems] = useState<ResearchItem[] | null>(null)
  const [connectionCount, setConnectionCount] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { data: feat } = await supabase.from('research_items').select('*')
        .eq('published', true).eq('featured', true).order('published_at', { ascending: false }).limit(3)
      setFeatured(feat ?? [])

      const { data: lat } = await supabase.from('research_items').select('*')
        .eq('published', true).order('published_at', { ascending: false }).limit(4)
      setLatest(lat ?? [])

      if (profile?.industry_id) {
        const { data } = await supabase.from('research_items').select('*')
          .eq('published', true).eq('industry_id', profile.industry_id).limit(4)
        setIndustryItems(data ?? [])
      } else setIndustryItems([])

      if (profile?.country_id) {
        const { data } = await supabase.from('research_items').select('*')
          .eq('published', true).eq('country_id', profile.country_id).limit(4)
        setCountryItems(data ?? [])
      } else setCountryItems([])

      if (profile) {
        const { count } = await supabase.from('connections')
          .select('id', { count: 'exact', head: true })
          .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`)
        setConnectionCount(count ?? 0)
      }
    }
    load()
  }, [profile])

  return (
    <div className="container-app py-8 space-y-10">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-ink-700/70 mt-1">Here's what's worth your attention today.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <Link key={a.label} to={a.to} className="card p-4 flex flex-col items-center text-center gap-2 hover:shadow-lg transition-shadow">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <a.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-ink-800">{a.label}</span>
          </Link>
        ))}
      </div>

      <section>
        <SectionHeader title="Featured IGCA Research" subtitle="Hand-picked research worth your time this week" showAllHref="/learn/research" />
        {featured === null ? <LoadingGrid /> : featured.length === 0 ? (
          <EmptyState icon={BookOpen} title="No featured research yet" description="Check back soon for curated research picks." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((item) => <ResearchCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Latest Insights" subtitle="Recently published across all industries and markets" showAllHref="/learn/research" />
        {latest === null ? <LoadingGrid /> : latest.length === 0 ? (
          <EmptyState title="Nothing published yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latest.map((item) => <ResearchCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      {industryItems && industryItems.length > 0 && (
        <section>
          <SectionHeader title="Your Industry Insights" subtitle="Personalized to your profile" showAllHref="/learn" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industryItems.map((item) => <ResearchCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {countryItems && countryItems.length > 0 && (
        <section>
          <SectionHeader title="Country Insights" subtitle="Market updates relevant to where you operate" showAllHref="/learn" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {countryItems.map((item) => <ResearchCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Continue Learning" subtitle="Pick up where you left off" showAllHref="/learn/courses" />
        <Link to="/learn/courses" className="card p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-ink-900">Your enrolled courses</p>
              <p className="text-sm text-ink-700/60">View progress and pick up your next module</p>
            </div>
          </div>
          <TrendingUp className="h-5 w-5 text-ink-700/40" />
        </Link>
      </section>

      <section className="card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-surface-100 text-ink-700 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-ink-900">Your professional network</p>
            <p className="text-sm text-ink-700/60">
              {connectionCount === null ? 'Loading…' : `${connectionCount} connection${connectionCount === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        <Link to="/network" className="btn-secondary">View network</Link>
      </section>
    </div>
  )
}
