import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'

export function SignupForm() {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-jade/10 border border-jade/20 px-4 py-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-jade/20">
          <svg className="h-5 w-5 text-jade-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-jade-light">Check your email</p>
          <p className="mt-1 text-sm text-jade">Click the confirmation link to complete sign up.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-lacquer/10 border border-lacquer/20 px-4 py-3 text-sm text-lacquer-light">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-parchment-muted mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="block w-full rounded-xl border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm text-parchment transition-colors placeholder:text-parchment-faint focus:border-lacquer/50 focus:outline-none focus:ring-2 focus:ring-lacquer/20"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-parchment-muted mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="block w-full rounded-xl border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm text-parchment transition-colors placeholder:text-parchment-faint focus:border-lacquer/50 focus:outline-none focus:ring-2 focus:ring-lacquer/20"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-parchment-muted mb-1.5">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          className="block w-full rounded-xl border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm text-parchment transition-colors placeholder:text-parchment-faint focus:border-lacquer/50 focus:outline-none focus:ring-2 focus:ring-lacquer/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-lacquer px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-lacquer/20 transition-all hover:bg-lacquer-light hover:shadow-xl hover:shadow-lacquer/30 focus:outline-none focus:ring-2 focus:ring-lacquer focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:hover:shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating account...
          </span>
        ) : (
          'Create account'
        )}
      </button>
    </form>
  )
}
