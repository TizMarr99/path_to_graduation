import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function GuessTitleAuthorChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onSubmit,
  disabled,
  onAudioPlay,
}) {
  const canSubmit = Boolean(
    draftAnswer.titleAnswer.trim() || draftAnswer.authorAnswer.trim(),
  )

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <ChallengeAssetGallery assets={challenge.assets} onAudioPlay={onAudioPlay} />

        <div className="grid gap-4 md:grid-cols-2">
          <input
            autoComplete="off"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            id={`${challenge.id}-title`}
            onChange={(event) => onDraftAnswerChange({ titleAnswer: event.target.value })}
            placeholder={challenge.titlePlaceholder || 'Titolo del brano'}
            type="text"
            value={draftAnswer.titleAnswer}
          />

          <input
            autoComplete="off"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            id={`${challenge.id}-author`}
            onChange={(event) => onDraftAnswerChange({ authorAnswer: event.target.value })}
            placeholder={challenge.authorPlaceholder || 'Autore o artista'}
            type="text"
            value={draftAnswer.authorAnswer}
          />
        </div>
      </div>

      <ChallengeSubmitButton disabled={disabled || !canSubmit} />
    </form>
  )
}

export default GuessTitleAuthorChallenge