import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Copy, Link2, TrendingUp, ShieldAlert, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { shareSnapshotOnWhatsApp, recordCopyOrLinkShare, buildWhatsAppWebUrl } from '@/services/whatsappShare'
import { LoadingGrid, ErrorState } from '@/components/ui/States'
import type { ResearchSnapshot, ResearchItem } from '@/types/database'

export default function SnapshotView() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [snapshot, setSnapshot] = useState<ResearchSnapshot | null>(null)
  const [research, setResearch] = useState<ResearchItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'link' | 'summary' | null>(null)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    async function load() {
      setError(null); setSnapshot(null)
      const { data, error } = await supabase.from('research_snapshots').select('*').eq('id', id).single()
      if (error || !data) { setError('Snapshot not found.'); return }
      setSnapshot(data)
      const { data: r } = await supabase.from('research_items').select('*').eq('id', data.research_id).single()
      setResearch(r ?? null)
    }
    if (id) load()
  }, [id])

  if (error) return <div className="container-app py-8"><ErrorState message={error} /></div>
  if (!snapshot || !research) return <div className="container-app py-8"><LoadingGrid count={1} /></div>

  const shareLink = `${window.location.origin}/learn/research/${research.slug}`
  const summaryText = `${snapshot.headline}\n\n${snapshot.executive_summary}\n\nRead more: ${shareLink}\n\n— via IGCA`

  async function handleWhatsAppShare() {
    if (!profile) return
    setSharing(true)
    await shareSnapshotOnWhatsApp({
      userId: profile.id, snapshotId: snapshot!.id,
      headline: snapshot!.headline, summary: snapshot!.executive_summary, link: shareLink
    })
    setSharing(false)
    window.open(buildWhatsAppWebUrl(summaryText), '_blank')
  }

  async function handleCopy(type: 'link' | 'summary') {
    await navigator.clipboard.writeText(type === 'link' ? shareLink : summaryText)
    if (profile) await recordCopyOrLinkShare(profile.id, snapshot!.id, type === 'link' ? 'link' : 'copy')
    setCopied(type)
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <div className="container-app py-8 max-w-2xl mx-auto">
      <Link to={`/learn/research/${research.slug}`} className="btn-ghost mb-4"><ArrowLeft className="h-4 w-4" /> Back to full research</Link>

      {/* The Snapshot card — designed to look right when forwarded externally */}
      <div className="card overflow-hidden">
        <div className="bg-ink-950 text-white p-5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gold-500 flex items-center justify-center text-ink-950 font-display font-semibold text-sm">IG</div>
          <div>
            <p className="font-display font-semibold leading-none">IGCA Research Snapshot</p>
            <p className="text-xs text-white/50 mt-0.5">{new Date(snapshot.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="p-6">
          <h1 className="font-display text-2xl font-semibold text-ink-900 leading-snug mb-3">{snapshot.headline}</h1>
          <p className="text-ink-700/80 mb-5">{snapshot.executive_summary}</p>

          <p className="text-xs font-bold uppercase tracking-wide text-ink-700/50 mb-2">Key Findings</p>
          <ul className="space-y-2 mb-5">
            {snapshot.key_findings.map((f, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-800">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600 mt-1.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>

          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {snapshot.key_opportunity && (
              <div className="rounded-xl bg-emerald-50 p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700 mb-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Opportunity
                </p>
                <p className="text-sm text-emerald-900">{snapshot.key_opportunity}</p>
              </div>
            )}
            {snapshot.key_risk && (
              <div className="rounded-xl bg-amber-50 p-3.5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700 mb-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Risk
                </p>
                <p className="text-sm text-amber-900">{snapshot.key_risk}</p>
              </div>
            )}
          </div>

          <p className="text-sm text-ink-700/80 border-t border-ink-900/5 pt-4">{snapshot.conclusion}</p>
          <p className="text-xs text-ink-700/40 mt-4">Source: {research.source ?? 'IGCA Research Desk'} · igca.app</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <button onClick={handleWhatsAppShare} disabled={sharing} className="btn-primary bg-[#25D366] hover:bg-[#1fb959]">
          <MessageCircle className="h-4 w-4" /> {sharing ? 'Preparing…' : 'Share on WhatsApp'}
        </button>
        <button onClick={() => handleCopy('link')} className="btn-secondary">
          {copied === 'link' ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} Copy Link
        </button>
        <button onClick={() => handleCopy('summary')} className="btn-secondary">
          {copied === 'summary' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy Summary
        </button>
      </div>
      <p className="text-xs text-ink-700/50 mt-3">
        Sharing sends this snapshot only to the contact you choose — IGCA never messages your contacts automatically.
      </p>
    </div>
  )
}
