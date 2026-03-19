import { useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'

export function LoginForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
    }
    setLoading(false)
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
          placeholder="Enter your password"
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
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  )
}
