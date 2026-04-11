import { useState } from 'react'
import { matchesAcceptedAnswer } from '../../../lib/answerNormalization'
import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function MusicalChainChallenge({
  challenge,
  draftAnswer,
  challengeState,
  onDraftAnswerChange,
  onChallengeStateChange,
  onSubmit,
  disabled,
  onAudioPlay,
}) {
  const [intermediateError, setIntermediateError] = useState('')
  const stageIndex = Math.min(
    challenge.stages.length - 1,
    challengeState.musicalChainStageIndex ?? 0,
  )
  const currentStage = challenge.stages[stageIndex]
  const isLastStage = stageIndex >= challenge.stages.length - 1

  function handleAttempt(event) {
    event.preventDefault()

    if (disabled || !draftAnswer.textAnswer.trim()) {
      return
    }

    if (matchesAcceptedAnswer(draftAnswer.textAnswer, challenge.acceptedAnswers) || isLastStage) {
      setIntermediateError('')
      onSubmit(event)
      return
    }

    setIntermediateError(`“${draftAnswer.textAnswer.trim()}” non e corretto. Passi alla traccia successiva.`)
    onChallengeStateChange({ musicalChainStageIndex: stageIndex + 1 })
    onDraftAnswerChange({ textAnswer: '' })
  }

  return (
    <form className="space-y-5" onSubmit={handleAttempt}>
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold leading-8 text-white">{challenge.prompt}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Se sbagli prima dell'ultima traccia, la catena si espande e puoi riprovare senza chiudere subito il quiz.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/75">
            Fase attuale
          </p>
          <p className="mt-2 text-lg font-semibold text-amber-50">
            {currentStage.title || `Ascolto ${stageIndex + 1}`} ({stageIndex + 1}/{challenge.stages.length})
          </p>
        </div>

        {intermediateError ? (
          <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-5 py-4 text-sm leading-6 text-rose-50">
            {intermediateError}
          </div>
        ) : null}

        <ChallengeAssetGallery assets={currentStage.assets} onAudioPlay={onAudioPlay} />

        <input
          autoComplete="off"
          className={[
            'w-full rounded-2xl border bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
            intermediateError
              ? 'border-rose-300/45 focus:border-rose-300/55 focus:ring-rose-400/20'
              : 'border-slate-700 focus:border-cyan-300/55 focus:ring-cyan-400/20',
          ].join(' ')}
          disabled={disabled}
          onChange={(event) => {
            setIntermediateError('')
            onDraftAnswerChange({ textAnswer: event.target.value })
          }}
          placeholder="Titolo del brano"
          type="text"
          value={draftAnswer.textAnswer}
        />
      </div>

      <ChallengeSubmitButton
        disabled={disabled || !draftAnswer.textAnswer.trim()}
        label={isLastStage ? 'Conferma risposta finale' : 'Prova con questa traccia'}
      />
    </form>
  )
}

export default MusicalChainChallenge