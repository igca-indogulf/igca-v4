import { Link } from 'react-router-dom'
import { PlayCircle, Clock, GraduationCap, Award } from 'lucide-react'
import type { LearningVideo, Course } from '@/types/database'

export function VideoCard({ video }: { video: LearningVideo }) {
  const minutes = Math.round(video.duration_seconds / 60)
  return (
    <a href={video.video_url} target="_blank" rel="noreferrer" className="card p-4 flex flex-col hover:shadow-lg transition-shadow">
      <div className="h-28 rounded-xl bg-ink-900 mb-3 flex items-center justify-center">
        <PlayCircle className="h-9 w-9 text-white/80" />
      </div>
      <h3 className="font-semibold text-ink-900 leading-snug mb-1.5 line-clamp-2">{video.title}</h3>
      <p className="text-sm text-ink-700/70 line-clamp-2 mb-3 flex-1">{video.description}</p>
      <span className="flex items-center gap-1 text-xs text-ink-700/60">
        <Clock className="h-3.5 w-3.5" /> {minutes} min
      </span>
    </a>
  )
}

export function CourseCard({ course, progress }: { course: Course; progress?: number }) {
  return (
    <Link to={`/learn/courses/${course.id}`} className="card p-4 flex flex-col hover:shadow-lg transition-shadow">
      <div className="h-28 rounded-xl bg-gradient-to-br from-gold-500/20 to-brand-700/20 mb-3 flex items-center justify-center">
        <GraduationCap className="h-9 w-9 text-brand-700/60" />
      </div>
      <span className="chip mb-2 w-fit capitalize">{course.level}</span>
      <h3 className="font-semibold text-ink-900 leading-snug mb-1.5 line-clamp-2">{course.title}</h3>
      <p className="text-sm text-ink-700/70 line-clamp-2 mb-3 flex-1">{course.description}</p>
      {typeof progress === 'number' && (
        <div className="mb-2">
          <div className="h-1.5 rounded-full bg-ink-900/5 overflow-hidden">
            <div className="h-full bg-brand-600 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-ink-700/60 mt-1 block">{progress}% complete</span>
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-ink-700/60 pt-2 border-t border-ink-900/5">
        <span>{course.total_modules} modules</span>
        {course.offers_certification && (
          <span className="flex items-center gap-1 text-gold-500 font-semibold"><Award className="h-3.5 w-3.5" /> Certificate</span>
        )}
      </div>
    </Link>
  )
}
