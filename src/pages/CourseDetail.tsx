import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, Award, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingGrid, ErrorState } from '@/components/ui/States'
import type { Course, CourseModule, CourseEnrollment, LearningProgress } from '@/types/database'

export default function CourseDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<CourseModule[]>([])
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null)
  const [progress, setProgress] = useState<Record<string, LearningProgress>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    setError(null); setCourse(null)
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single()
    if (error || !data) { setError('Course not found.'); return }
    setCourse(data)
    const { data: mods } = await supabase.from('course_modules').select('*').eq('course_id', id).order('sort_order')
    setModules(mods ?? [])

    if (profile) {
      const { data: enr } = await supabase.from('course_enrollments').select('*').eq('user_id', profile.id).eq('course_id', id).maybeSingle()
      setEnrollment(enr ?? null)
      const { data: prog } = await supabase.from('learning_progress').select('*').eq('user_id', profile.id)
      const map: Record<string, LearningProgress> = {}
      prog?.forEach((p) => { map[p.module_id] = p })
      setProgress(map)
    }
  }

  useEffect(() => { if (id) load() }, [id, profile])

  async function handleEnroll() {
    if (!profile || !course) return
    setBusy(true)
    const { data } = await supabase.from('course_enrollments').insert({
      user_id: profile.id, course_id: course.id, status: 'enrolled', progress_percent: 0
    }).select().single()
    setEnrollment(data ?? null)
    setBusy(false)
  }

  async function toggleModule(moduleId: string) {
    if (!profile || !course) return
    const done = progress[moduleId]?.completed
    const { data } = await supabase.from('learning_progress').upsert({
      user_id: profile.id, module_id: moduleId, completed: !done, completed_at: !done ? new Date().toISOString() : null
    }, { onConflict: 'user_id,module_id' }).select().single()
    if (data) setProgress((p) => ({ ...p, [moduleId]: data }))

    const completedCount = Object.values({ ...progress, [moduleId]: data }).filter((p) => p?.completed).length
    const pct = Math.round((completedCount / modules.length) * 100)
    const status = pct === 100 ? 'completed' : pct > 0 ? 'in_progress' : 'enrolled'
    await supabase.from('course_enrollments').update({
      progress_percent: pct, status, completed_at: pct === 100 ? new Date().toISOString() : null
    }).eq('user_id', profile.id).eq('course_id', course.id)
    setEnrollment((e) => e ? { ...e, progress_percent: pct, status } : e)

    if (pct === 100 && course.offers_certification) {
      await supabase.from('certifications').insert({
        user_id: profile.id, course_id: course.id, title: `${course.title} — Certificate`,
        credential_code: 'IGCA-' + Math.random().toString(36).slice(2, 9).toUpperCase()
      })
    }
  }

  if (error) return <div className="container-app py-8"><ErrorState message={error} /></div>
  if (!course) return <div className="container-app py-8"><LoadingGrid count={1} /></div>

  return (
    <div className="container-app py-8 max-w-3xl mx-auto">
      <Link to="/learn/courses" className="btn-ghost mb-4"><ArrowLeft className="h-4 w-4" /> Back to Courses</Link>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="chip mb-2 capitalize">{course.level}</span>
            <h1 className="font-display text-2xl font-semibold text-ink-900">{course.title}</h1>
            <p className="text-ink-700/70 mt-2">{course.description}</p>
            <p className="text-sm text-ink-700/60 mt-3">Instructor: {course.instructor}</p>
          </div>
          {!enrollment ? (
            <button onClick={handleEnroll} disabled={busy} className="btn-primary shrink-0">
              {busy ? 'Enrolling…' : 'Enroll now'}
            </button>
          ) : (
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-ink-900 capitalize">{enrollment.status.replace('_', ' ')}</p>
              <p className="text-xs text-ink-700/60">{enrollment.progress_percent}% complete</p>
            </div>
          )}
        </div>
        {course.offers_certification && (
          <div className="flex items-center gap-1.5 text-sm text-gold-500 font-semibold mt-4">
            <Award className="h-4 w-4" /> Certificate on completion
          </div>
        )}
      </div>

      <h2 className="font-display text-lg font-semibold text-ink-900 mb-3">Modules</h2>
      <div className="space-y-2">
        {modules.map((m) => {
          const done = progress[m.id]?.completed
          return (
            <button
              key={m.id}
              onClick={() => enrollment && toggleModule(m.id)}
              disabled={!enrollment}
              className="w-full card p-4 flex items-center gap-3 text-left disabled:opacity-60"
            >
              {done ? <CheckCircle2 className="h-5 w-5 text-brand-600 shrink-0" /> : <Circle className="h-5 w-5 text-ink-700/30 shrink-0" />}
              <span className="flex-1 font-medium text-ink-900">{m.title}</span>
              <span className="flex items-center gap-1 text-xs text-ink-700/60"><Clock className="h-3.5 w-3.5" /> {m.duration_minutes} min</span>
            </button>
          )
        })}
      </div>
      {!enrollment && <p className="text-sm text-ink-700/60 mt-3">Enroll to track your progress through these modules.</p>}
    </div>
  )
}
