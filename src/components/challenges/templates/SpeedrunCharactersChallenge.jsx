import { useCallback, useEffect, useRef, useState } from 'react'
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
}) {
  const timerSeconds = challenge.timerSeconds ?? 30
  const [timeLeft, setTimeLeft] = useState(timerSeconds)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [results, setResults] = useState({})
  const timerRef = useRef(null)
  const inputRef = useRef(null)
  const isFinished = timeLeft <= 0 || currentIndex >= challenge.characters.length

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (disabled || isFinished) return

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
  }, [disabled, isFinished, stopTimer])

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
    if (!disabled && !isFinished && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentIndex, disabled, isFinished])

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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            Personaggio {currentIndex + 1}/{challenge.characters.length}
          </p>
          <p
            className={[
              'text-sm font-bold tabular-nums',
              timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-300',
            ].join(' ')}
          >
            {timeLeft}s
          </p>
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
