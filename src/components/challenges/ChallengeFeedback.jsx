const speakerLabels = {
  curator: 'Il Curatore',
  critic: 'Il Critico',
  neutral: 'La Sala',
}

function ChallengeFeedback({ feedback, onContinue }) {
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
        {speakerLabels[feedback.speaker]}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">{feedback.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-100/90">{feedback.message}</p>
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