import { useFullscreen } from '../hooks/useFullscreen.js'

function GlobalFullscreenToggle() {
  const { isSupported, isFullscreen, isPending, error, toggleFullscreen } = useFullscreen()
  if (!isSupported) return null

  const label = isFullscreen ? 'Esci dallo schermo intero' : 'Schermo intero'

  return (
    <div className="relative">
      {error ? (
        <p role="status" className="absolute bottom-full right-0 mb-3 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-amber-300/40 bg-slate-950 p-3 text-sm text-amber-100 shadow-xl">
          {error}
        </p>
      ) : null}
      <button
        aria-label={label}
        aria-pressed={isFullscreen}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-500/55 bg-slate-950/90 text-slate-200 shadow-[0_0_28px_rgba(15,23,42,0.28)] backdrop-blur-xl transition hover:border-cyan-300/55 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        onClick={toggleFullscreen}
        title={isFullscreen ? `${label} (Esc)` : label}
        type="button"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={isFullscreen
            ? 'M4 9h5V4m6 0v5h5M4 15h5v5m6 0v-5h5'
            : 'M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5'} />
        </svg>
      </button>
    </div>
  )
}

export default GlobalFullscreenToggle
