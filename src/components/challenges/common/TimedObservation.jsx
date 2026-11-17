import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { observationPhase } from '../../../lib/visualChallengeRules.js'

const EMPTY_DEADLINES = {}

function TimedObservation({ round, challengeState, onChallengeStateChange, disabled, children }) {
  const [requested, setRequested] = useState(false)
  const [now, setNow] = useState(Date.now)
  const [error, setError] = useState(false)
  const [imageAttempt, setImageAttempt] = useState(0)
  const loaded = useRef(new Set())
  const started = useRef(false)
  const frame = useRef(0)
  const dialogRef = useRef(null)
  const answerRef = useRef(null)
  const deadlines = challengeState.observationDeadlines ?? EMPTY_DEADLINES
  const deadline = deadlines[round.id]
  const phase = observationPhase(deadline, now)
  const images = round.assets.filter((asset) => asset.kind === 'image')
  const isObserving = phase === 'viewing' || (phase === 'unseen' && requested)
  const secondsLeft = Math.min(round.displaySeconds, Math.max(0, Math.ceil((deadline - now) / 1000)))

  // Two frames let the decoded image and the modal reach the screen before
  // committing the absolute deadline. Resuming never creates a new deadline.
  const startWhenVisible = useCallback(() => {
    if (phase !== 'unseen' || started.current || loaded.current.size !== images.length || document.hidden) return
    window.cancelAnimationFrame(frame.current)
    frame.current = window.requestAnimationFrame(() => {
      frame.current = window.requestAnimationFrame(() => {
        if (document.hidden || started.current) return
        started.current = true
        const loadedAt = Date.now()
        setNow(loadedAt)
        onChallengeStateChange({ observationDeadlines: {
          ...deadlines, [round.id]: loadedAt + round.displaySeconds * 1000,
        } })
      })
    })
  }, [phase, images.length, deadlines, round.id, round.displaySeconds, onChallengeStateChange])

  useEffect(() => {
    if (phase !== 'viewing') return
    const timer = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(timer)
  }, [phase])

  useLayoutEffect(() => {
    if (!isObserving) return
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [isObserving])

  useEffect(() => {
    if (!isObserving) return
    // A parent render can replace the callback between image load and paint.
    // Reschedule loaded images rather than leaving a cancelled start pending.
    startWhenVisible()
    function handleVisibilityChange() {
      setNow(Date.now())
      startWhenVisible()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.cancelAnimationFrame(frame.current)
    }
  }, [isObserving, startWhenVisible])

  useEffect(() => {
    if (phase !== 'answering') return
    answerRef.current?.focus({ preventScroll: true })
    answerRef.current?.scrollIntoView({ block: 'start' })
  }, [phase])

  function retryImages() {
    loaded.current.clear()
    setError(false)
    setImageAttempt((attempt) => attempt + 1)
  }

  return (
    <div className="space-y-4">
      {phase === 'unseen' && !requested ? (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-slate-300">La foto si apre a tutto schermo per {round.displaySeconds} secondi, poi compare la domanda. Non serve ingrandire o scorrere.</p>
          <button className="min-h-12 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:opacity-50" type="button"
            disabled={disabled || !images.length} onClick={() => { setNow(Date.now()); setRequested(true) }}>
            Osserva per {round.displaySeconds} secondi
          </button>
        </div>
      ) : null}
      {isObserving ? createPortal(
        <dialog ref={dialogRef} aria-label="Osservazione della foto" aria-modal="true" tabIndex={-1}
          className="fixed inset-0 m-0 flex h-dvh max-h-none w-screen max-w-none flex-col gap-3 overflow-hidden bg-slate-950 p-3 text-slate-100 outline-none backdrop:bg-slate-950 sm:gap-4 sm:p-5"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))', paddingLeft: 'max(0.75rem, env(safe-area-inset-left))', paddingRight: 'max(0.75rem, env(safe-area-inset-right))' }}
          onCancel={(event) => { event.preventDefault(); if (phase === 'unseen') { setRequested(false); setError(false); loaded.current.clear() } }}>
          <header className="flex shrink-0 items-center justify-between gap-3">
            <h2 className="text-sm font-semibold sm:text-lg">Osserva la foto</h2>
            <p role="timer" aria-live="off" className="shrink-0 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-base font-semibold tabular-nums text-amber-100">
              {phase === 'viewing' ? `${secondsLeft} s` : 'Caricamento…'}
            </p>
          </header>
          <div className="relative grid min-h-0 flex-1 auto-cols-fr grid-flow-col gap-3">
            {images.map((asset, index) => (
              <img key={`${imageAttempt}-${index}`} alt={asset.alt || 'Foto da osservare'} src={asset.src} decoding="sync"
                className={`h-full min-h-0 w-full min-w-0 object-contain ${phase === 'unseen' ? 'invisible' : ''}`}
                onLoad={() => { loaded.current.add(index); startWhenVisible() }} onError={() => setError(true)} />
            ))}
            {phase === 'unseen' ? <div className="absolute inset-0 flex items-center justify-center p-4 text-center" role="status">
              {error ? <div className="max-w-md space-y-4">
                <p>La foto non si è caricata. Il tempo non è ancora partito.</p>
                <button className="rounded-full border border-cyan-300/40 px-5 py-3 text-cyan-100" type="button" onClick={retryImages}>Riprova caricamento</button>
                <button className="block w-full py-2 text-sm text-slate-300" type="button" onClick={() => { setRequested(false); setError(false); loaded.current.clear() }}>Torna alla prova</button>
              </div> : 'Preparo la foto. Il tempo parte quando è visibile.'}
            </div> : null}
          </div>
          <footer className="shrink-0 space-y-2">
            <div className="h-1 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
              <div className="h-full bg-amber-300 transition-[width] duration-100 ease-linear motion-reduce:transition-none"
                style={{ width: phase === 'viewing' ? `${Math.max(0, Math.min(100, (deadline - now) / (round.displaySeconds * 10)))}%` : '100%' }} />
            </div>
            <p className="text-center text-xs text-slate-300">La foto scompare automaticamente. Poi potrai rispondere con calma.</p>
          </footer>
        </dialog>, document.body) : null}
      {phase === 'answering' ? <div ref={answerRef} tabIndex={-1} className="scroll-mt-4 outline-none">{children}</div> : null}
    </div>
  )
}

export default TimedObservation
