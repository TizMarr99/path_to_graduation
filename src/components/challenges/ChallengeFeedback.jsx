import { getRoomSpeakerLabel } from '../../lib/roomSpeakers'

function ChallengeFeedback({ feedback, onContinue, creditReward, awardedCredits }) {
  const hasAwardedCredits = typeof awardedCredits === 'number'

  return (
    <section
      aria-live="polite"
      className={[
        'rounded-2xl border px-5 py-5',
        feedback.isCorrect
          ? 'border-emerald-300/30 bg-emerald-400/10'
          : 'border-rose-300/25 bg-rose-400/10',
      ].join(' ')}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-100/75">
        {getRoomSpeakerLabel(feedback.speaker)}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">{feedback.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-100/90">{feedback.message}</p>
      {hasAwardedCredits && awardedCredits > 0 ? (
        <p className="mt-2 text-sm font-semibold text-amber-300">
          +{awardedCredits} {typeof creditReward === 'number' && awardedCredits < creditReward ? 'crediti parziali' : 'crediti'} 🪙
        </p>
      ) : null}
      {feedback.solutionLines?.length ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-200/75">
            Soluzione
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100/90">
            {feedback.solutionLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {typeof feedback.maxScore === 'number' ? (
        <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-200/75">
          Punteggio: {feedback.scoreEarned ?? 0}/{feedback.maxScore}
        </p>
      ) : null}

      <button
        className="mt-5 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
        onClick={onContinue}
        type="button"
      >
        Continua
      </button>
    </section>
  )
}

export default ChallengeFeedback