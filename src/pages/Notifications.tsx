import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, UserPlus, CheckCircle2, BookOpen, GraduationCap, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingGrid, EmptyState } from '@/components/ui/States'
import type { AppNotification, NotificationType } from '@/types/database'

const ICONS: Record<NotificationType, typeof Bell> = {
  connection_request: UserPlus,
  connection_accepted: CheckCircle2,
  research_published: BookOpen,
  course_update: GraduationCap,
  system: Info
}

export default function Notifications() {
  const { profile } = useAuth()
  const [items, setItems] = useState<AppNotification[] | null>(null)

  async function load() {
    if (!profile) return
    const { data } = await supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(50)
    setItems(data ?? [])
  }

  useEffect(() => { load() }, [profile])

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setItems((prev) => prev?.map((n) => n.id === id ? { ...n, read: true } : n) ?? null)
  }

  async function markAllRead() {
    if (!profile) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false)
    setItems((prev) => prev?.map((n) => ({ ...n, read: true })) ?? null)
  }

  return (
    <div className="container-app py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Notifications</h1>
        {items && items.some((n) => !n.read) && (
          <button onClick={markAllRead} className="btn-ghost">Mark all as read</button>
        )}
      </div>

      {items === null ? <LoadingGrid count={4} /> : items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New notifications will appear here." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Info
            const content = (
              <div className={`card p-4 flex gap-3 items-start ${!n.read ? 'border-l-4 border-l-brand-600' : ''}`}>
                <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 text-sm">{n.title}</p>
                  {n.body && <p className="text-sm text-ink-700/70 mt-0.5">{n.body}</p>}
                  <p className="text-xs text-ink-700/40 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            )
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={() => !n.read && markRead(n.id)}>{content}</Link>
            ) : (
              <div key={n.id} onClick={() => !n.read && markRead(n.id)}>{content}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
