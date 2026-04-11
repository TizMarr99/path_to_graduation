import { renderChallengeOrFallback } from '../../lib/challengeRegistry'

const speakerLabels = {
  curator: 'Il Curatore',
  critic: 'Il Critico',
  neutral: 'La Sala',
}

function ChallengeRenderer({
  challenge,
  disabled,
  draftAnswer,
  challengeState,
  onAudioPlay,
  onChallengeStateChange,
  onDraftAnswerChange,
  onSubmit,
}) {
  return (
    <div className="space-y-5">
      {challenge.introNarration ? (
        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/75">
            {speakerLabels[challenge.speaker ?? 'curator']}
          </p>
          <p className="mt-2 text-sm leading-7 text-amber-50/90">{challenge.introNarration}</p>
        </section>
      ) : null}

      {renderChallengeOrFallback(challenge, {
        challenge,
        disabled,
        draftAnswer,
        challengeState,
        onAudioPlay,
        onChallengeStateChange,
        onDraftAnswerChange,
        onSubmit,
      })}
    </div>
  )
}

export default ChallengeRenderer