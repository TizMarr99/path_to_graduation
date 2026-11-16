import { useEffect, useRef, useState } from 'react'
import { observationPhase } from '../../../lib/visualChallengeRules.js'

const EMPTY_DEADLINES = {}

function TimedObservation({ round, challengeState, onChallengeStateChange, disabled, children }) {
  const [requested, setRequested] = useState(false)
  const [now, setNow] = useState(Date.now)
  const [error, setError] = useState(false)
  const loaded = useRef(new Set())
  const deadlines = challengeState.observationDeadlines ?? EMPTY_DEADLINES
  const deadline = deadlines[round.id]
  const phase = observationPhase(deadline, now)
  const images = round.assets.filter((asset) => asset.kind === 'image')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(timer)
  }, [])

  function handleLoad(index, loadedAt) {
    loaded.current.add(index)
    if (loaded.current.size === images.length && phase === 'unseen' && !document.hidden) {
      onChallengeStateChange({ observationDeadlines: {
        ...deadlines, [round.id]: loadedAt + round.displaySeconds * 1000,
      } })
    }
  }

  useEffect(() => {
    function resumeLoadedObservation() {
      if (!document.hidden && requested && loaded.current.size === images.length && phase === 'unseen') {
        onChallengeStateChange({ observationDeadlines: {
          ...deadlines, [round.id]: Date.now() + round.displaySeconds * 1000,
        } })
      }
    }
    document.addEventListener('visibilitychange', resumeLoadedObservation)
    return () => document.removeEventListener('visibilitychange', resumeLoadedObservation)
  }, [requested, images.length, phase, deadlines, round.id, round.displaySeconds, onChallengeStateChange])

  return (
    <div className="space-y-4">
      {phase === 'unseen' && !requested ? (
        <button className="rounded-full border border-cyan-300/40 px-4 py-2 text-cyan-100" type="button"
          disabled={disabled || !images.length} onClick={() => setRequested(true)}>
          Osserva per {round.displaySeconds} secondi
        </button>
      ) : null}
      {phase === 'viewing' || (phase === 'unseen' && requested) ? (
        <div className="space-y-3">
          <p role="status" className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-amber-100">{phase === 'viewing' ? `Tempo per osservare: ${Math.max(0, Math.ceil((deadline - now) / 1000))} s` : 'Caricamento immagine…'}</p>
          {images.map((asset, index) => (
            <img key={asset.src} src={asset.src} alt="Immagine da osservare"
              className={`h-64 w-full object-contain sm:h-80 ${phase === 'unseen' ? 'invisible' : ''}`}
              onLoad={() => handleLoad(index, Date.now())} onError={() => setError(true)} />
          ))}
          {error ? <p role="alert">Immagine non caricata. Riapri la prova per riprovare: il tempo non parte finché il caricamento non è completo.</p> : null}
        </div>
      ) : null}
      {phase === 'answering' ? children : null}
    </div>
  )
}

export default TimedObservation
