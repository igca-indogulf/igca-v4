import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="font-display text-6xl font-semibold text-ink-900 mb-2">404</p>
      <p className="text-ink-700/70 mb-6">This page doesn't exist.</p>
      <Link to="/home" className="btn-primary">Back to Home</Link>
    </div>
  )
}
