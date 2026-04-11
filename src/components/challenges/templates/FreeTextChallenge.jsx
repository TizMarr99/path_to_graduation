import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function FreeTextChallenge({ challenge, draftAnswer, onDraftAnswerChange, onSubmit, disabled, onAudioPlay }) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <label className="block text-xl font-semibold leading-8 text-white" htmlFor={challenge.id}>
          {challenge.prompt}
        </label>

        <ChallengeAssetGallery assets={challenge.assets} onAudioPlay={onAudioPlay} />

        <input
          autoComplete="off"
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id={challenge.id}
          onChange={(event) => onDraftAnswerChange({ textAnswer: event.target.value })}
          placeholder={challenge.placeholder ?? 'Affida una parola alla sala'}
          type="text"
          value={draftAnswer.textAnswer}
        />
      </div>

      <ChallengeSubmitButton disabled={disabled || !draftAnswer.textAnswer.trim()} />
    </form>
  )
}

export default FreeTextChallenge