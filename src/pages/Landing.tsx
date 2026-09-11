import { Link } from 'react-router-dom'
import { BookOpen, Share2, MessageCircle, GraduationCap, Users, ArrowRight, Sparkles } from 'lucide-react'

export default function Landing() {
  return (
    <div className="bg-white">
      <header className="border-b border-ink-900/5">
        <div className="container-app flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-ink-900 flex items-center justify-center text-gold-400 font-display font-semibold text-sm">IG</div>
            <span className="font-display font-semibold text-lg text-ink-900">IGCA</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary">Sign in</Link>
            <Link to="/signup" className="btn-primary">Join IGCA</Link>
          </div>
        </div>
      </header>

      <section className="container-app py-20 sm:py-28 text-center max-w-3xl mx-auto">
        <span className="chip mb-5"><Sparkles className="h-3.5 w-3.5 mr-1" /> Research · Insights · Learn & Grow</span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink-900 leading-tight mb-5">
          Professional intelligence that makes you sharper — and easy to share.
        </h1>
        <p className="text-lg text-ink-700/70 mb-8">
          IGCA delivers research, insights and courses built for working professionals — then turns
          the best of it into a concise, client-ready snapshot you can share in seconds.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary !px-6 !py-3">Join IGCA <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/login" className="btn-secondary !px-6 !py-3">Sign in</Link>
        </div>
      </section>

      <section className="container-app pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Feature icon={GraduationCap} title="Learn & Grow" desc="Industry, country and network content — plus courses and certifications built for professionals." />
          <Feature icon={BookOpen} title="IGCA Research" desc="First-class research with executive summaries, key findings and clear conclusions." />
          <Feature icon={Share2} title="Research Snapshots" desc="Every research item can become a concise, branded snapshot ready to forward." />
          <Feature icon={MessageCircle} title="WhatsApp Sharing" desc="Share valuable research with an existing client or prospect in one tap — never spam." />
        </div>
      </section>

      <section className="bg-ink-950 text-white py-20">
        <div className="container-app grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold mb-4">Turn research into a conversation with your clients.</h2>
            <p className="text-white/60 mb-6">
              Open any research item, generate its Research Snapshot, and share it directly with a client
              or prospect on WhatsApp — professional, concise, and attributed to IGCA.
            </p>
            <Link to="/signup" className="btn-primary !bg-gold-500 !text-ink-950 hover:!bg-gold-400">Get started</Link>
          </div>
          <div className="card bg-white p-6">
            <div className="bg-ink-950 text-white rounded-lg p-3 flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded bg-gold-500 flex items-center justify-center text-ink-950 font-display font-semibold text-xs">IG</div>
              <span className="text-sm font-semibold">IGCA Research Snapshot</span>
            </div>
            <p className="font-display text-lg font-semibold text-ink-900 mb-2">India Fintech: Capital Is Rotating Toward Infrastructure</p>
            <p className="text-sm text-ink-700/70 mb-3">Fintech capital in India shifted decisively toward SME lending and embedded finance infrastructure in H1 2026.</p>
            <div className="h-px bg-ink-900/10 my-3" />
            <p className="text-xs text-ink-700/50">Source: IGCA Research Desk</p>
          </div>
        </div>
      </section>

      <section className="container-app py-16 text-center">
        <div className="flex items-center justify-center gap-2 text-ink-700/60 mb-2">
          <Users className="h-5 w-5" /> <span className="text-sm">A supporting network of professionals — not another social feed.</span>
        </div>
        <p className="text-ink-700/50 text-sm max-w-lg mx-auto">
          Connect & Network and Find New Clients help you build real relationships around the research you already trust.
        </p>
      </section>

      <footer className="border-t border-ink-900/5 py-8">
        <div className="container-app text-sm text-ink-700/50 flex items-center justify-between">
          <span>© {new Date().getFullYear()} IGCA</span>
          <div className="flex gap-4">
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Join</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Feature({ icon: Icon, title, desc }: { icon: typeof BookOpen; title: string; desc: string }) {
  return (
    <div className="card p-5">
      <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-semibold text-ink-900 mb-1">{title}</p>
      <p className="text-sm text-ink-700/60">{desc}</p>
    </div>
  )
}
