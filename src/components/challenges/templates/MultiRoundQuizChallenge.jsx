import SequentialRoundChallenge from '../common/SequentialRoundChallenge.jsx'
import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

export default function MultiRoundQuizChallenge(props) {
  const { challenge, draftAnswer, onDraftAnswerChange, onSubmit, disabled } = props
  if (!challenge.simultaneousRounds) return <SequentialRoundChallenge {...props} />
  const answers = draftAnswer.multiRoundAnswers ?? {}
  return <form className="space-y-5" onSubmit={onSubmit}>
    <h3 className="text-xl font-semibold text-white">{challenge.prompt}</h3>
    <p className="text-slate-300">Servono {challenge.minimumCorrectRounds} effetti corretti su {challenge.rounds.length}.</p>
    <ChallengeAssetGallery assets={challenge.assets} />
    <div className="grid gap-5 md:grid-cols-2">
      {challenge.rounds.map((round, i) => <article key={round.id} className="space-y-3 rounded-xl border border-slate-700 p-4">
        <ChallengeAssetGallery assets={round.assets} />
        <label className="block text-white">Effetto {i + 1}
          <input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
            autoComplete="off" value={answers[round.id] ?? ''} disabled={disabled}
            onChange={(e) => onDraftAnswerChange({ multiRoundAnswers: { ...answers, [round.id]: e.target.value } })} />
        </label>
      </article>)}
    </div>
    <ChallengeSubmitButton disabled={disabled || challenge.rounds.some((r) => !(answers[r.id] ?? '').trim())} />
  </form>
}
