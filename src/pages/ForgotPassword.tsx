import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthLayout, Field } from './Login'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a secure link to reset your password.">
      {sent ? (
        <p className="text-sm bg-brand-50 text-brand-700 rounded-lg px-3 py-3">
          If an account exists for {email}, a reset link has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <Field label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
          </Field>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="text-sm text-ink-700/70 text-center mt-6">
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
