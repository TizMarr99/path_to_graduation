import { renderChallengeOrFallback } from '../../lib/challengeRegistry'
import { getRoomSpeakerLabel } from '../../lib/roomSpeakers'

function ChallengeRenderer({
  challenge,
  disabled,
  draftAnswer,
  challengeState,
  onAudioPlay,
  onChallengeStateChange,
  onDraftAnswerChange,
  onSubmit,
  showHeader = true,
  credits,
  onBuyTime,
}) {
  return (
    <div className="space-y-5">
      {showHeader ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
            {getRoomSpeakerLabel(challenge.speaker)}
          </p>
          <h2 className="mt-3 text-xl font-semibold leading-8 text-white sm:text-2xl">
            {challenge.title || 'Prova della sala'}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-200/92">{challenge.prompt}</p>
        </div>
      ) : null}

      {showHeader && challenge.introNarration ? (
        <section className="rounded-2xl border border-amber-300/20 bg-amber-300/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/75">
            {getRoomSpeakerLabel(challenge.speaker)}
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
        credits,
        onBuyTime,
      })}
    </div>
  )
}

export default ChallengeRenderer