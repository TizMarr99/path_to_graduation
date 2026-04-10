import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function renderSolutionInput({ challenge, draftAnswer, onDraftAnswerChange, disabled }) {
  if (challenge.solution.mode === 'multiple_choice') {
    return (
      <fieldset className="space-y-3" disabled={disabled}>
        {challenge.solution.choices.map((choice) => {
          const isSelected = draftAnswer.selectedChoiceId === choice.id

          return (
            <label
              key={choice.id}
              className={[
                'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition',
                isSelected
                  ? 'border-amber-300/70 bg-amber-300/10 text-amber-50'
                  : 'border-slate-800 bg-slate-900/70 text-slate-200 hover:border-cyan-300/45 hover:bg-slate-900',
                disabled ? 'cursor-not-allowed opacity-75' : '',
              ].join(' ')}
            >
              <input
                checked={isSelected}
                className="mt-1 h-4 w-4 border-slate-600 bg-slate-950 text-amber-300"
                name={`${challenge.id}-solution`}
                onChange={() => onDraftAnswerChange({ selectedChoiceId: choice.id })}
                type="radio"
                value={choice.id}
              />
              <span className="text-sm leading-6">{choice.text}</span>
            </label>
          )
        })}
      </fieldset>
    )
  }

  return (
    <input
      autoComplete="off"
      className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onChange={(event) => onDraftAnswerChange({ textAnswer: event.target.value })}
      placeholder="Ricostruisci la chiave finale"
      type="text"
      value={draftAnswer.textAnswer}
    />
  )
}

function MultiStageProgressiveRevealChallenge({
  challenge,
  draftAnswer,
  challengeState,
  onDraftAnswerChange,
  onChallengeStateChange,
  onSubmit,
  disabled,
}) {
  const revealedStageCount = Math.max(
    challenge.initialVisibleStages,
    challengeState.revealedStageCount,
  )
  const visibleStages = challenge.stages.slice(0, revealedStageCount)
  const hasMoreStages = revealedStageCount < challenge.stages.length
  const scorePreview = Math.max(
    challenge.scoring.minScore,
    challenge.scoring.maxScore -
      Math.max(0, revealedStageCount - challenge.initialVisibleStages) * challenge.scoring.revealPenalty,
  )
  const canSubmit =
    challenge.solution.mode === 'multiple_choice'
      ? Boolean(draftAnswer.selectedChoiceId)
      : Boolean(draftAnswer.textAnswer.trim())

  function handleRevealNextStage() {
    if (!hasMoreStages) {
      return
    }

    onChallengeStateChange({ revealedStageCount: revealedStageCount + 1 })
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold leading-8 text-white">{challenge.prompt}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Ogni rivelazione aggiunge un indizio ma riduce il punteggio ottenibile.
          </p>
        </div>

        <ChallengeAssetGallery assets={challenge.assets} />

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/75">
            Ricompensa attuale
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-50">
            {scorePreview} / {challenge.scoring.maxScore}
          </p>
        </div>

        <div className="space-y-3">
          {visibleStages.map((stage, index) => (
            <article
              key={stage.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                Indizio {index + 1}
              </p>
              {stage.title ? (
                <h4 className="mt-2 text-lg font-semibold text-white">{stage.title}</h4>
              ) : null}
              <p className="mt-2 text-sm leading-7 text-slate-300">{stage.body}</p>
              <ChallengeAssetGallery assets={stage.assets ?? []} />
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled || !hasMoreStages}
            onClick={handleRevealNextStage}
            type="button"
          >
            {hasMoreStages ? 'Rivela un nuovo indizio' : 'Tutti gli indizi sono visibili'}
          </button>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Indizi visibili: {revealedStageCount}/{challenge.stages.length}
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/65 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
            Soluzione finale
          </p>
          {renderSolutionInput({
            challenge,
            draftAnswer,
            onDraftAnswerChange,
            disabled,
          })}
        </div>
      </div>

      <ChallengeSubmitButton disabled={disabled || !canSubmit} />
    </form>
  )
}

export default MultiStageProgressiveRevealChallenge