import { useEffect, useState } from 'react'

function CharacterToast({ toast, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let frameId = 0

    if (!toast) {
      frameId = requestAnimationFrame(() => setIsVisible(false))
      return () => cancelAnimationFrame(frameId)
    }

    frameId = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frameId)
  }, [toast])

  if (!toast) return null

  const toneClasses =
    toast.tone === 'silver'
      ? 'border-stone-300/30 bg-stone-900/90 shadow-[0_0_40px_rgba(255,255,255,0.08)]'
      : 'border-amber-300/30 bg-amber-950/90 shadow-[0_0_40px_rgba(212,175,55,0.12)]'

  const nameColor = toast.tone === 'silver' ? 'text-stone-200' : 'text-amber-200'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        className={[
          'pointer-events-auto flex max-w-md items-center gap-4 rounded-2xl border px-5 py-4 backdrop-blur-xl transition-all duration-500 ease-out',
          toneClasses,
          isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-6 opacity-0 scale-95',
        ].join(' ')}
      >
        {toast.characterImage ? (
          <img
            alt={toast.characterName}
            className="h-12 w-12 shrink-0 rounded-full border border-white/15 object-cover"
            src={toast.characterImage}
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg font-bold text-white">
            {toast.characterName.charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-white/45">
            {toast.archetypeLabel ?? 'Presenza della mostra'}
          </p>
          <p className={['mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.3em]', nameColor].join(' ')}>
            {toast.characterName}
          </p>
          <p className="mt-2 text-sm leading-5 text-white/90">{toast.text}</p>
        </div>

        <button
          className="shrink-0 rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white/80"
          onClick={onDismiss}
          type="button"
          aria-label="Chiudi"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CharacterToast
