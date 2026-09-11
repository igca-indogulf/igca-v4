import { useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { CourseCard } from '@/components/learn/Cards'
import { LoadingGrid, EmptyState, ErrorState } from '@/components/ui/States'
import type { Course, CourseEnrollment } from '@/types/database'

export default function CoursesListing() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [enrollments, setEnrollments] = useState<Record<string, CourseEnrollment>>({})
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null); setCourses(null)
    const { data, error } = await supabase.from('courses').select('*').order('created_at')
    if (error) { setError(error.message); return }
    setCourses(data ?? [])

    if (profile) {
      const { data: enr } = await supabase.from('course_enrollments').select('*').eq('user_id', profile.id)
      const map: Record<string, CourseEnrollment> = {}
      enr?.forEach((e) => { map[e.course_id] = e })
      setEnrollments(map)
    }
  }

  useEffect(() => { load() }, [profile])

  return (
    <div className="container-app py-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Courses</h1>
        <p className="text-ink-700/70 mt-1">Practitioner-led courses with certification on completion.</p>
      </div>

      {error ? <ErrorState message={error} onRetry={load} /> : courses === null ? <LoadingGrid count={8} /> : courses.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No courses available yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} progress={enrollments[c.id]?.progress_percent} />
          ))}
        </div>
      )}
    </div>
  )
}
