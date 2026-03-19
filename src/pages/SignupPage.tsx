import { Link, Navigate } from 'react-router-dom'
import { SignupForm } from '@/components/auth/SignupForm'
import { useAuth } from '@/context/AuthContext'

export function SignupPage() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  return (
    <div className="grain flex min-h-screen items-center justify-center px-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-lacquer/5 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[400px] w-[400px] rounded-full bg-jade/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center slide-up">
          {/* Logo */}
          <div className="mx-auto mb-5 relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rotate-45 rounded-xl bg-lacquer shadow-xl shadow-lacquer/30" />
            <svg className="relative h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-parchment">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-parchment-faint">Start organizing with Nha Bao Viec</p>
        </div>
        <div className="slide-up stagger-2 rounded-2xl border border-ink-800 bg-ink-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <SignupForm />
        </div>
        <p className="slide-up stagger-3 mt-6 text-center text-sm text-parchment-faint">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-lacquer-light hover:text-lacquer transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
