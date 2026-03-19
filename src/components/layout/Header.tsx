import { useAuth } from '@/context/AuthContext'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function Header() {
  const { user, signOut } = useAuth()
  const isOnline = useOnlineStatus()

  return (
    <header className="sticky top-0 z-10 border-b border-ink-800 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Logo mark — lacquer red diamond */}
          <div className="relative flex h-9 w-9 items-center justify-center">
            <div className="absolute inset-0 rotate-45 rounded-[5px] bg-lacquer shadow-lg shadow-lacquer/20" />
            <svg className="relative h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-parchment">
              Nha Bao Viec
            </h1>
          </div>
          <span
            className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase transition-colors ${
              isOnline
                ? 'bg-jade/10 text-jade-light'
                : 'bg-gold/10 text-gold'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOnline ? 'bg-jade-light animate-pulse' : 'bg-gold'
              }`}
            />
            {isOnline ? 'Synced' : 'Offline'}
          </span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 border border-ink-700 text-xs font-semibold text-parchment-muted">
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <button
              onClick={signOut}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-parchment-faint transition-colors hover:bg-ink-800 hover:text-parchment"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
