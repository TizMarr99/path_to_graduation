import { useEffect, useRef, useState } from 'react'

/**
 * Full-size character panel for displaying character comments.
 *
 * Props:
 *   character      - { name, role, imageSrc, tone }
 *   message        - string to display
 *   visible        - boolean (controls mount/unmount with fade)
 *   onDismiss      - callback (called on click or tap)
 *   autoDismissMs  - number, default 3000; pass 0 to disable built-in timer
 *   mirror         - boolean; if true, portrait is on the right (used for Sal / critic)
 */
function CharacterPanel({ character, message, visible, onDismiss, autoDismissMs = 3000, mirror = false }) {
  const [isShown, setIsShown] = useState(false)
  const [isMounted, setIsMounted] = useState(!!visible)
  const fadeOutTimerRef = useRef(null)
  const autoDismissTimerRef = useRef(null)

  useEffect(() => {
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current)
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current)

    if (visible) {
      setIsMounted(true)
      const frameId = requestAnimationFrame(() => setIsShown(true))

      if (autoDismissMs > 0) {
        autoDismissTimerRef.current = setTimeout(() => {
          onDismiss?.()
        }, autoDismissMs)
      }

      return () => {
        cancelAnimationFrame(frameId)
        if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current)
      }
    } else {
      setIsShown(false)
      fadeOutTimerRef.current = setTimeout(() => setIsMounted(false), 500)
      return () => {
        if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current)
      }
    }
  }, [visible, autoDismissMs, onDismiss])

  useEffect(() => {
    return () => {
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current)
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current)
    }
  }, [])

  if (!isMounted) return null

  const isSilver = character?.tone === 'silver'
  const accentBorder = isSilver ? 'border-stone-300/30' : 'border-amber-300/30'
  const accentBg = isSilver ? 'bg-stone-900/95' : 'bg-amber-950/95'
  const accentGlow = isSilver
    ? 'shadow-[0_0_50px_rgba(180,180,180,0.07)]'
    : 'shadow-[0_0_50px_rgba(212,175,55,0.10)]'
  const nameColor = isSilver ? 'text-stone-200' : 'text-amber-200'
  const accentLine = isSilver ? 'bg-stone-400/40' : 'bg-amber-300/40'

  const portraitEl = character?.imageSrc ? (
    <div
      className="overflow-hidden rounded-[1.15rem] border border-white/12 shrink-0"
      style={{ width: '6.5rem', height: '9rem' }}
    >
      <img
        alt={character.name}
        className="h-full w-full object-cover object-top"
        src={character.imageSrc}
      />
    </div>
  ) : (
    <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl font-bold text-white">
      {character?.name?.charAt(0) ?? '?'}
    </div>
  )

  const labelEl = (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-white/45 text-center">
        {character?.role}
      </p>
      <p className={['text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-center', nameColor].join(' ')}>
        {character?.name}
      </p>
    </div>
  )

  const messageEl = (
    <div className={['flex flex-1 min-w-0 items-center', mirror ? 'justify-end text-right' : ''].join(' ')}>
      <div>
        <div className={['mb-3 h-px w-10', accentLine, mirror ? 'ml-auto' : ''].join(' ')} />
        <p className="text-sm leading-6 text-white/90 italic">&ldquo;{message}&rdquo;</p>
        <p className={['mt-3 text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-white/30', mirror ? 'text-right' : ''].join(' ')}>
          Tocca per chiudere
        </p>
      </div>
    </div>
  )

  const innerContent = mirror ? (
    <>
      {messageEl}
      <div className={['flex flex-col items-center gap-2', mirror ? 'items-end' : ''].join(' ')}>
        {portraitEl}
        {labelEl}
      </div>
    </>
  ) : (
    <>
      <div className="flex flex-col items-center gap-2">
        {portraitEl}
        {labelEl}
      </div>
      {messageEl}
    </>
  )

  return (
    <div
      className={[
        'overflow-hidden rounded-[2rem] border backdrop-blur-xl cursor-pointer select-none',
        'transition-all duration-500 ease-out',
        accentBorder,
        accentBg,
        accentGlow,
        isShown && visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]',
      ].join(' ')}
      onClick={onDismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDismiss?.()
      }}
      role="button"
      tabIndex={0}
      aria-label="Chiudi commento personaggio"
    >
      <div className={['flex flex-col gap-4 p-5 sm:gap-5 sm:p-6', mirror ? 'sm:flex-row-reverse' : 'sm:flex-row'].join(' ')}>
        {innerContent}
      </div>
    </div>
  )
}

export default CharacterPanel
