import { usePlayerState } from '../hooks/usePlayerState'

function GlobalMusicToggle() {
  const { isMusicEnabled, toggleMusicEnabled } = usePlayerState()

  return (
    <button
      aria-label={isMusicEnabled ? 'Disattiva la musica automatica' : 'Attiva la musica automatica'}
      className={[
        'fixed bottom-5 right-5 z-[120] inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] shadow-[0_0_28px_rgba(15,23,42,0.28)] backdrop-blur-xl transition',
        isMusicEnabled
          ? 'border-amber-300/55 bg-slate-950/78 text-amber-100 hover:border-amber-200/75 hover:bg-slate-900/88'
          : 'border-slate-500/55 bg-slate-950/78 text-slate-200 hover:border-cyan-300/55 hover:text-cyan-100',
      ].join(' ')}
      onClick={toggleMusicEnabled}
      type="button"
    >
      <span aria-hidden="true">{isMusicEnabled ? '♫' : '∅'}</span>
      <span>{isMusicEnabled ? 'Musica on' : 'Musica off'}</span>
    </button>
  )
}

export default GlobalMusicToggle