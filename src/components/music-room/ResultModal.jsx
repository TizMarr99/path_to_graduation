function ResultModal({
  isOpen,
  feedback,
  mode = 'fresh',
  awardedCredits,
  creditReward,
  onClose,
  onContinue,
  disabled,
  characterComment,
  errorImageSrc,
  errorOpacity,
}) {
  if (!isOpen || !feedback) {
    return null
  }

  const hasAwardedCredits = typeof awardedCredits === 'number' && awardedCredits > 0
  const hasScore = typeof feedback.maxScore === 'number'
  const hasSolutionContent = Boolean(feedback.message) || Boolean(feedback.solutionLines?.length)
  const isHistoryMode = mode === 'history'
  const character = characterComment?.character
  const isSilver = character?.tone === 'silver'
  const accentName = isSilver ? 'text-stone-300' : 'text-amber-300'
  const accentLine = isSilver ? 'bg-stone-400/40' : 'bg-amber-300/40'
  const panelTone = feedback.isCorrect
    ? 'border-emerald-300/20 bg-emerald-500/8'
    : 'border-white/10 bg-slate-950/40'

  const footerParts = [
    hasScore ? `Punteggio: ${feedback.scoreEarned ?? 0}/${feedback.maxScore}` : null,
    hasAwardedCredits
      ? `+${awardedCredits} ${typeof creditReward === 'number' && awardedCredits < creditReward ? 'crediti parziali' : 'crediti'}`
      : null,
  ].filter(Boolean)

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/92 px-4 py-6"
      role="dialog"
    >
      {!feedback.isCorrect && errorImageSrc ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 flex w-[42vw] max-w-[40rem] items-center justify-end pr-3 select-none sm:pr-6 lg:pr-10"
          style={{ opacity: errorOpacity ?? 0.45 }}
        >
          <img
            alt=""
            className="error-image-reveal block h-[72vh] max-h-[580px] w-auto object-contain"
            src={errorImageSrc}
          />
        </div>
      ) : null}

      <div
        className={[
          'relative z-10 flex w-full max-w-2xl flex-col rounded-[2rem] border p-6 shadow-[0_0_90px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-7',
          feedback.isCorrect
            ? 'border-emerald-300/30 bg-emerald-500/10'
            : 'border-rose-300/25 bg-rose-500/10 sm:-translate-x-8 lg:-translate-x-12',
        ].join(' ')}
      >
        {characterComment && character ? (
          <div className="mb-5 flex items-start gap-4">
            {character.imageSrc ? (
              <div
                className="shrink-0 overflow-hidden rounded-[1rem] border border-white/12"
                style={{ width: '4.5rem', height: '6rem' }}
              >
                <img
                  alt={character.name}
                  className="h-full w-full object-cover object-top"
                  src={character.imageSrc}
                />
              </div>
            ) : null}

            <div className="min-w-0 flex-1 pt-1">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-white/45">
                {character.role}
              </p>
              <p
                className={[
                  'mt-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em]',
                  accentName,
                ].join(' ')}
              >
                {character.name}
              </p>
              <div className={['my-2 h-px w-8', accentLine].join(' ')} />
              <p className="text-sm leading-6 text-white/88 italic">&ldquo;{characterComment.text}&rdquo;</p>
            </div>
          </div>
        ) : null}

        <h2 className="text-2xl font-semibold tracking-tight text-white">{feedback.title}</h2>

        {hasSolutionContent ? (
          <div
            className={[
              'mt-5 w-full rounded-[1.5rem] border px-5 py-5',
              panelTone,
            ].join(' ')}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-200/75">
              Soluzione
            </p>

            {feedback.message ? (
              <p className="mt-3 text-sm leading-6 text-slate-100/90">{feedback.message}</p>
            ) : null}

            {feedback.solutionLines?.length ? (
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-100/90">
                {feedback.solutionLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-200/75">
            {footerParts.length ? footerParts.join(' | ') : 'Esito registrato'}
          </p>

          <button
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isHistoryMode && disabled}
            onClick={isHistoryMode ? onClose : onContinue}
            type="button"
          >
            {isHistoryMode ? 'Chiudi' : 'Continua'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultModal
