import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthLayout, Field } from './Login'
import type { AccountType } from '@/types/database'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'founder', label: 'Founder' },
  { value: 'investor', label: 'Investor' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'industry_expert', label: 'Industry Expert' },
  { value: 'student', label: 'Student' },
  { value: 'other', label: 'Other' }
]

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState<AccountType>('professional')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, username, account_type: accountType } }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/home', { replace: true })
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join IGCA for research, insights and professional growth.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <Field label="Full name">
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Jane Doe" />
        </Field>
        <Field label="Username">
          <input required value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} className="input" placeholder="jane_doe" />
        </Field>
        <Field label="I am a…">
          <select value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)} className="input">
            {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Email">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
        </Field>
        <Field label="Password">
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 8 characters" />
        </Field>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-ink-700/70 text-center mt-6">
        Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
