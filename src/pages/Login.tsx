import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname: string } } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate(location.state?.from?.pathname ?? '/home', { replace: true })
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your research and insights.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <Field label="Email">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="input" placeholder="you@company.com" />
        </Field>
        <Field label="Password">
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="input" placeholder="••••••••" />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-ink-700/70 text-center mt-6">
        New to IGCA? <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">Create an account</Link>
      </p>
    </AuthLayout>
  )
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink-950 text-white p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gold-500 flex items-center justify-center text-ink-950 font-display font-semibold">IG</div>
          <span className="font-display font-semibold text-xl">IGCA</span>
        </Link>
        <div>
          <p className="font-display text-3xl leading-snug mb-3">Research, insights and growth for working professionals.</p>
          <p className="text-white/60 max-w-md">Turn IGCA's research into shareable insight your clients and prospects actually want to read.</p>
        </div>
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} IGCA. All rights reserved.</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
          <p className="text-ink-700/70 mt-1 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink-800 mb-1.5">{label}</span>
      {children}
    </label>
  )
}
