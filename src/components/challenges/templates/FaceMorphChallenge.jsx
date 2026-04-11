import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function FaceMorphChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onSubmit,
  disabled,
  onAudioPlay,
}) {
  const answers = draftAnswer.faceMorphAnswers ?? []
  const hasAnyAnswer = answers.some((answer) => answer.trim())

  function handleAnswerChange(index, value) {
    const nextAnswers = [...answers]
    nextAnswers[index] = value
    onDraftAnswerChange({ faceMorphAnswers: nextAnswers })
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <label className="block text-xl font-semibold leading-8 text-white" htmlFor={`${challenge.id}-slot-0`}>
          {challenge.prompt}
        </label>

        <ChallengeAssetGallery assets={challenge.assets} onAudioPlay={onAudioPlay} />

        <div className="grid gap-3 md:grid-cols-3">
          {answers.map((answer, index) => (
            <input
              key={`${challenge.id}-slot-${index}`}
              autoComplete="off"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
              id={`${challenge.id}-slot-${index}`}
              onChange={(event) => handleAnswerChange(index, event.target.value)}
              placeholder={`${challenge.placeholder || 'Inserisci un cantante'} ${index + 1}`}
              type="text"
              value={answer}
            />
          ))}
        </div>

        <p className="text-sm leading-6 text-slate-300">
          Ne bastano {challenge.minimumCorrectGroups} su {challenge.singerGroups.length}. Sono ammessi anche i cognomi quando previsti.
        </p>
      </div>

      <ChallengeSubmitButton disabled={disabled || !hasAnyAnswer} />
    </form>
  )
}

export default FaceMorphChallenge