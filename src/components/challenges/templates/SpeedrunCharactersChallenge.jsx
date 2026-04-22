import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { matchesAcceptedAnswer } from '../../../lib/answerNormalization'
import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function SpeedrunCharactersChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onChallengeStateChange,
  onSubmit,
  disabled,
  challengeState,
  credits = 0,
  onBuyTime,
}) {
  const timerSeconds = challenge.timerSeconds ?? 40
  const BUY_TIME_SECONDS = 10
  const BUY_TIME_COST = 15

  // If the component mounts with speedrunStarted already true it means the user
  // navigated away mid-run; treat that as an expired timer (challenge lost).
  const alreadyStartedOnMount = challengeState?.speedrunStarted === true
  const [started, setStarted] = useState(alreadyStartedOnMount)
  const [timeLeft, setTimeLeft] = useState(alreadyStartedOnMount ? 0 : timerSeconds)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [results, setResults] = useState({})
  const timerRef = useRef(null)
  const inputRef = useRef(null)
  const isFinished = timeLeft <= 0 || currentIndex >= challenge.characters.length
  const timerRunning = started && !isFinished && !disabled
  const [confirmBuyTime, setConfirmBuyTime] = useState(false)
  const canAffordTime = typeof onBuyTime === 'function' && credits >= BUY_TIME_COST

  // Block in-app navigation while the timer is running
  const blocker = useBlocker(timerRunning)

  // Block browser refresh / tab close while the timer is running
  useEffect(() => {
    if (!timerRunning) return

    function handleBeforeUnload(event) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [timerRunning])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!started || disabled || isFinished) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return stopTimer
  }, [started, disabled, isFinished, stopTimer])

  useEffect(() => {
    if (isFinished) {
      const answers = {}
      Object.entries(results).forEach(([charId, answer]) => {
        answers[charId] = answer
      })
      onDraftAnswerChange({ speedrunAnswers: answers })
      onChallengeStateChange({
        speedrunCurrentIndex: currentIndex,
        speedrunTimeRemaining: timeLeft,
      })
    }
  }, [isFinished, results, currentIndex, timeLeft, onDraftAnswerChange, onChallengeStateChange])

  useEffect(() => {
    if (!disabled && started && !isFinished && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentIndex, disabled, started, isFinished])

  function handleStart() {
    setStarted(true)
    onChallengeStateChange({ speedrunStarted: true })
  }

  function handleConfirmBuyTime() {
    if (!canAffordTime) return
    const success = onBuyTime(BUY_TIME_SECONDS, BUY_TIME_COST)
    if (success) {
      setTimeLeft((prev) => prev + BUY_TIME_SECONDS)
    }
    setConfirmBuyTime(false)
  }

  function handleAnswerSubmit(event) {
    event?.preventDefault()
    if (disabled || isFinished) return

    const character = challenge.characters[currentIndex]
    if (!character) return

    setResults((prev) => ({ ...prev, [character.id]: inputValue }))
    setInputValue('')
    setCurrentIndex((prev) => prev + 1)
  }

  function handleSkip() {
    if (disabled || isFinished) return

    const character = challenge.characters[currentIndex]
    if (!character) return

    onDraftAnswerChange({
      speedrunSkippedIds: [...(draftAnswer.speedrunSkippedIds ?? []), character.id],
    })
    setCurrentIndex((prev) => prev + 1)
    setInputValue('')
  }

  const correctCount = Object.entries(results).filter(([charId, answer]) => {
    const character = challenge.characters.find((c) => c.id === charId)
    return character && matchesAcceptedAnswer(answer, character.acceptedAnswers)
  }).length

  const progressPercent = Math.max(0, (timeLeft / timerSeconds) * 100)
  const currentCharacter = !isFinished ? challenge.characters[currentIndex] : null

  // Navigation blocker confirmation overlay
  if (blocker.state === 'blocked') {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-rose-400/30 bg-rose-950/50 px-5 py-6 text-center space-y-4">
          <p className="text-2xl">⚠️</p>
          <p className="text-lg font-semibold text-rose-100">
            Stai per abbandonare la challenge!
          </p>
          <p className="text-sm text-rose-200/80">
            Se esci adesso il cronometro non si ferma e la challenge sarà considerata persa.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              className="rounded-full border border-slate-600 bg-slate-900/80 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/55 hover:text-cyan-100"
              onClick={() => blocker.reset()}
              type="button"
            >
              Rimani
            </button>
            <button
              className="rounded-full border border-rose-400/50 bg-rose-500/20 px-6 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/35"
              onClick={() => blocker.proceed()}
              type="button"
            >
              Esci lo stesso
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Start screen — shown before the timer has begun
  if (!started) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 px-5 py-6 text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            Speedrun · {challenge.characters.length} personaggi
          </p>
          <p className="text-base text-slate-200 leading-7">
            Hai <span className="font-bold text-cyan-300">{timerSeconds} secondi</span> per
            nominare quanti più personaggi possibile. Una volta avviato il cronometro non può essere
            fermato e abbandonare la pagina farà perdere la challenge.
          </p>
          <p className="text-sm text-slate-400">
            Obiettivo: almeno{' '}
            <span className="font-semibold text-amber-300">{challenge.minimumCorrect}</span>{' '}
            personaggi corretti.
          </p>
        </div>
        <button
          className="inline-flex w-full items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/15 px-5 py-3.5 text-base font-semibold text-cyan-50 transition hover:border-cyan-300/70 hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={handleStart}
          type="button"
        >
          Avvia cronometro
        </button>
      </div>
    )
  }

  if (isFinished) {
    return (
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5 text-center">
            <p className="text-lg font-semibold text-slate-100">
              Tempo scaduto!
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Hai indovinato <span className="font-bold text-cyan-300">{correctCount}</span> su{' '}
              <span className="font-bold">{challenge.characters.length}</span> personaggi.
              {correctCount >= challenge.minimumCorrect ? (
                <span className="ml-1 text-emerald-400">Obiettivo raggiunto!</span>
              ) : (
                <span className="ml-1 text-amber-400">
                  Servivano almeno {challenge.minimumCorrect}.
                </span>
              )}
            </p>
          </div>
        </div>

        <ChallengeSubmitButton disabled={disabled} label="Conferma risultato" />
      </form>
    )
  }

  return (
    <form className="space-y-5" onSubmit={handleAnswerSubmit}>
      {/* Buy-time confirmation popup */}
      {confirmBuyTime && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-950/50 px-5 py-4 text-center space-y-3">
          <p className="text-sm font-semibold text-amber-100">
            Acquistare +{BUY_TIME_SECONDS}s per{' '}
            <span className="text-amber-300">🪙 {BUY_TIME_COST} crediti</span>?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              className="rounded-full border border-slate-600 bg-slate-900/80 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/55 hover:text-cyan-100"
              onClick={() => setConfirmBuyTime(false)}
              type="button"
            >
              Annulla
            </button>
            <button
              className="rounded-full border border-amber-400/50 bg-amber-500/20 px-5 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/35"
              onClick={handleConfirmBuyTime}
              type="button"
            >
              Conferma
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Personaggio {currentIndex + 1}/{challenge.characters.length}
          </p>
          <div className="flex items-center gap-2">
            {typeof onBuyTime === 'function' && !isFinished && !confirmBuyTime && (
              <button
                className={[
                  'rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                  canAffordTime
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20'
                    : 'border-slate-700 bg-slate-900/50 text-slate-500 cursor-not-allowed',
                ].join(' ')}
                disabled={!canAffordTime}
                onClick={() => setConfirmBuyTime(true)}
                title={canAffordTime ? `+${BUY_TIME_SECONDS}s · 🪙 ${BUY_TIME_COST}` : 'Crediti insufficienti'}
                type="button"
              >
                +{BUY_TIME_SECONDS}s · 🪙{BUY_TIME_COST}
              </button>
            )}
            <p
              className={[
                'text-sm font-bold tabular-nums',
                timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-300',
              ].join(' ')}
            >
              {timeLeft}s
            </p>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {currentCharacter && (
          <div className="space-y-3">
            <ChallengeAssetGallery
              assets={currentCharacter.assets}
              imageClassName="h-44 rounded-xl object-contain bg-slate-950 sm:h-52"
            />

            <p className="text-center text-sm font-medium text-slate-400">
              {currentCharacter.showName}
            </p>

            <div className="flex gap-3">
              <input
                ref={inputRef}
                autoComplete="off"
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={disabled}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Nome del personaggio"
                type="text"
                value={inputValue}
              />
              <button
                className="shrink-0 rounded-2xl border border-slate-700 bg-slate-950/85 px-4 py-3 text-sm font-semibold text-slate-400 transition hover:border-amber-300/45 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={disabled}
                onClick={handleSkip}
                type="button"
              >
                Salta
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Corretti finora: {correctCount} · Obiettivo: {challenge.minimumCorrect}
        </p>
      </div>

      <button
        className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-950/85 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || !inputValue.trim()}
        type="submit"
      >
        Conferma
      </button>
    </form>
  )
}

export default SpeedrunCharactersChallenge
