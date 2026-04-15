import { getRoomSpeakerLabel } from '../../lib/roomSpeakers'

function ResultModal({ isOpen, feedback, awardedCredits, creditReward, onContinue, disabled, characterComment, errorImageSrc, errorOpacity }) {
  if (!isOpen || !feedback) {
    return null
  }

  const hasAwardedCredits = typeof awardedCredits === 'number' && awardedCredits > 0
  const character = characterComment?.character
  const isSilver = character?.tone === 'silver'
  const accentName = isSilver ? 'text-stone-300' : 'text-amber-300'
  const accentLine = isSilver ? 'bg-stone-400/40' : 'bg-amber-300/40'

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/92 px-4 py-6" role="dialog" aria-modal="true">
      {!feedback.isCorrect && errorImageSrc ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 select-none"
          style={{ opacity: errorOpacity ?? 0.45 }}
        >
          <img
            alt=""
            className="error-image-reveal block h-[72vh] max-h-[580px] w-auto object-contain object-bottom"
            src={errorImageSrc}
          />
        </div>
      ) : null}
      <div
        className={[
          'relative z-10 w-full max-w-2xl rounded-[2rem] border p-6 shadow-[0_0_90px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-7',
          feedback.isCorrect
            ? 'border-emerald-300/30 bg-emerald-500/10'
            : 'border-rose-300/25 bg-rose-500/10',
        ].join(' ')}
      >
        {/* Character comment embedded at top */}
        {characterComment && character ? (
          <div className="mb-5 flex items-start gap-4">
            {/* Portrait */}
            {character.imageSrc ? (
              <div
                className="overflow-hidden rounded-[1rem] border border-white/12 shrink-0"
                style={{ width: '4.5rem', height: '6rem' }}
              >
                <img
                  alt={character.name}
                  className="h-full w-full object-cover object-top"
                  src={character.imageSrc}
                />
              </div>
            ) : null}

            {/* Text */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-white/45">
                {character.role}
              </p>
              <p className={['mt-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em]', accentName].join(' ')}>
                {character.name}
              </p>
              <div className={['my-2 h-px w-8', accentLine].join(' ')} />
              <p className="text-sm leading-6 text-white/88 italic">&ldquo;{characterComment.text}&rdquo;</p>
            </div>
          </div>
        ) : null}

        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-100/75">
          {getRoomSpeakerLabel(feedback.speaker)}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{feedback.title}</h2>
        <p className="mt-4 text-sm leading-7 text-slate-100/92">{feedback.message}</p>

        {hasAwardedCredits ? (
          <p className="mt-3 text-sm font-semibold text-amber-300">
            +{awardedCredits} {typeof creditReward === 'number' && awardedCredits < creditReward ? 'crediti parziali' : 'crediti'} 🪙
          </p>
        ) : null}

        {feedback.solutionLines?.length ? (
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/35 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-200/75">
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
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-200/75">
            Punteggio: {feedback.scoreEarned ?? 0}/{feedback.maxScore}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onClick={onContinue}
            type="button"
          >
            Continua
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultModal