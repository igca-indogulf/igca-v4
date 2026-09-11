import { useEffect, useRef, useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingGrid, EmptyState } from '@/components/ui/States'
import { Avatar } from '@/components/ui/Avatar'
import type { Conversation, Message, Profile } from '@/types/database'

interface ConvoWithMeta extends Conversation {
  otherUser?: Profile
  unread?: number
}

export default function Messages() {
  const { profile } = useAuth()
  const [conversations, setConversations] = useState<ConvoWithMeta[] | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  async function loadConversations() {
    if (!profile) return
    const { data: memberships } = await supabase.from('conversation_members').select('conversation_id').eq('user_id', profile.id)
    const ids = memberships?.map((m) => m.conversation_id) ?? []
    if (ids.length === 0) { setConversations([]); return }

    const { data: convos } = await supabase.from('conversations').select('*').in('id', ids).order('last_message_at', { ascending: false, nullsFirst: false })
    const enriched: ConvoWithMeta[] = []
    for (const c of convos ?? []) {
      const { data: members } = await supabase.from('conversation_members').select('user_id').eq('conversation_id', c.id).neq('user_id', profile.id)
      const otherId = members?.[0]?.user_id
      let otherUser: Profile | undefined
      if (otherId) {
        const { data } = await supabase.from('profiles').select('*').eq('id', otherId).single()
        otherUser = data ?? undefined
      }
      enriched.push({ ...c, otherUser })
    }
    setConversations(enriched)
    if (!activeId && enriched.length > 0) setActiveId(enriched[0].id)
  }

  async function loadMessages(conversationId: string) {
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at')
    setMessages(data ?? [])
    if (profile) {
      await supabase.from('conversation_members').update({ last_read_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('user_id', profile.id)
    }
  }

  useEffect(() => { loadConversations() }, [profile])
  useEffect(() => { if (activeId) loadMessages(activeId) }, [activeId])

  useEffect(() => {
    if (!activeId) return
    const channel = supabase
      .channel(`messages-${activeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        (payload) => setMessages((m) => [...m, payload.new as Message]))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage() {
    if (!draft.trim() || !activeId || !profile) return
    const content = draft.trim()
    setDraft('')
    await supabase.from('messages').insert({ conversation_id: activeId, sender_id: profile.id, content })
  }

  const active = conversations?.find((c) => c.id === activeId)

  return (
    <div className="container-app py-8">
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-6">Messages</h1>
      <div className="card grid grid-cols-1 md:grid-cols-[280px_1fr] h-[70vh] overflow-hidden">
        <div className="border-r border-ink-900/5 overflow-y-auto hidden md:block">
          {conversations === null ? (
            <div className="p-4"><LoadingGrid count={3} /></div>
          ) : conversations.length === 0 ? (
            <div className="p-4"><EmptyState icon={MessageSquare} title="No conversations yet" description="Connect with professionals to start messaging." /></div>
          ) : conversations.map((c) => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className={`w-full flex items-center gap-3 p-4 text-left border-b border-ink-900/5 hover:bg-surface-50 ${activeId === c.id ? 'bg-brand-50' : ''}`}>
              <div className="h-10 w-10 shrink-0">
                <Avatar url={c.otherUser?.avatar_url} name={c.otherUser?.full_name ?? '?'} size={40} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-ink-900 text-sm truncate">{c.otherUser?.full_name ?? 'Unknown'}</p>
                <p className="text-xs text-ink-700/50">{c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : ''}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-ink-700/50 text-sm">Select a conversation</div>
          ) : (
            <>
              <div className="p-4 border-b border-ink-900/5 flex items-center gap-3">
                <Avatar url={active.otherUser?.avatar_url} name={active.otherUser?.full_name ?? '?'} size={36} />
                <p className="font-semibold text-ink-900">{active.otherUser?.full_name}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3.5 py-2 rounded-2xl text-sm ${m.sender_id === profile?.id ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-surface-100 text-ink-900 rounded-bl-sm'}`}>
                      {m.content}
                      <p className={`text-[10px] mt-1 ${m.sender_id === profile?.id ? 'text-white/60' : 'text-ink-700/40'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-ink-900/5 flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message…" className="input flex-1" />
                <button onClick={sendMessage} className="btn-primary !px-3.5"><Send className="h-4 w-4" /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
