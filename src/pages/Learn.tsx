import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Share2, PlayCircle, GraduationCap, Award, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ResearchCard } from '@/components/research/ResearchCard'
import { VideoCard, CourseCard } from '@/components/learn/Cards'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { LoadingGrid, EmptyState } from '@/components/ui/States'
import type { ResearchItem, LearningVideo, Course } from '@/types/database'

export default function Learn() {
  const { profile } = useAuth()
  const [industryResearch, setIndustryResearch] = useState<ResearchItem[] | null>(null)
  const [countryResearch, setCountryResearch] = useState<ResearchItem[] | null>(null)
  const [networkResearch, setNetworkResearch] = useState<ResearchItem[] | null>(null)
  const [igcaResearch, setIgcaResearch] = useState<ResearchItem[] | null>(null)
  const [videos, setVideos] = useState<LearningVideo[] | null>(null)
  const [courses, setCourses] = useState<Course[] | null>(null)

  useEffect(() => {
    async function load() {
      const industryQuery = profile?.industry_id
        ? supabase.from('research_items').select('*').eq('published', true).eq('industry_id', profile.industry_id).limit(4)
        : supabase.from('research_items').select('*').eq('published', true).limit(4)
      const { data: ind } = await industryQuery
      setIndustryResearch(ind ?? [])

      const countryQuery = profile?.country_id
        ? supabase.from('research_items').select('*').eq('published', true).eq('country_id', profile.country_id).limit(4)
        : supabase.from('research_items').select('*').eq('published', true).order('published_at', { ascending: false }).limit(4)
      const { data: ctry } = await countryQuery
      setCountryResearch(ctry ?? [])

      const { data: net } = await supabase.from('research_items').select('*').eq('published', true).limit(4)
      setNetworkResearch(net ?? [])

      const { data: igca } = await supabase.from('research_items').select('*').eq('published', true).order('published_at', { ascending: false }).limit(4)
      setIgcaResearch(igca ?? [])

      const { data: vids } = await supabase.from('learning_videos').select('*').limit(4)
      setVideos(vids ?? [])

      const { data: crs } = await supabase.from('courses').select('*').limit(4)
      setCourses(crs ?? [])
    }
    load()
  }, [profile])

  return (
    <div className="container-app py-8 space-y-10">
      <div className="rounded-2xl bg-ink-950 text-white p-6 sm:p-8 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Learn & Grow</h1>
          <p className="text-white/60 mt-1 text-sm">Research, videos, courses and certifications — built to make you sharper at your job.</p>
        </div>
      </div>

      <section>
        <SectionHeader title="Latest in Your Industry" showAllHref="/learn/research?scope=industry" />
        {industryResearch === null ? <LoadingGrid /> : industryResearch.length === 0 ? (
          <EmptyState icon={BookOpen} title="No industry research yet" description="Set your industry in your profile to personalize this section." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industryResearch.map((item) => <ResearchCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Latest in Your Country" showAllHref="/learn/research?scope=country" />
        {countryResearch === null ? <LoadingGrid /> : countryResearch.length === 0 ? (
          <EmptyState icon={BookOpen} title="No country research yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {countryResearch.map((item) => <ResearchCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Latest in Your Network" subtitle="Useful information surfaced from your professional network" showAllHref="/learn/research?scope=network" />
        {networkResearch === null ? <LoadingGrid /> : networkResearch.length === 0 ? (
          <EmptyState title="Nothing from your network yet" description="Connect with more professionals to see relevant content here." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {networkResearch.map((item) => <ResearchCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="IGCA Research" subtitle="First-class research from the IGCA desk" showAllHref="/learn/research" />
        {igcaResearch === null ? <LoadingGrid /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {igcaResearch.map((item) => <ResearchCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Research Snapshots" subtitle="Concise, shareable versions of IGCA research" showAllHref="/learn/snapshots" />
        <Link to="/learn/snapshots" className="card p-6 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><Share2 className="h-6 w-6" /></div>
            <div>
              <p className="font-semibold text-ink-900">Browse all snapshots</p>
              <p className="text-sm text-ink-700/60">Ready to share with your clients and prospects</p>
            </div>
          </div>
        </Link>
      </section>

      <section>
        <SectionHeader title="Videos" showAllHref="/learn/videos" />
        {videos === null ? <LoadingGrid /> : videos.length === 0 ? (
          <EmptyState icon={PlayCircle} title="No videos yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Courses" showAllHref="/learn/courses" />
        {courses === null ? <LoadingGrid /> : courses.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No courses yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Certifications" subtitle="Track your credentials" />
        <Link to="/profile" className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center"><Award className="h-6 w-6" /></div>
          <div>
            <p className="font-semibold text-ink-900">View your certifications</p>
            <p className="text-sm text-ink-700/60">Earned by completing certification-eligible courses</p>
          </div>
        </Link>
      </section>
    </div>
  )
}
