function ChallengeHintPanel({
  hint,
  isVisible,
  onHintClick,
  onInfoClick,
  infoDisabled,
  infoDisabledReason,
  hintDisabled,
  hintDisabledReason,
  hintCost,
}) {
  const showCost = Boolean(hint) && typeof hintCost === 'number' && !isVisible

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Supporto prova
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {isVisible
              ? hint
              : 'Apri le informazioni della prova oppure acquista un indizio dalla lampadina.'}
          </p>
          {showCost ? (
            <p className="mt-1 text-xs text-amber-300/70">Costo indizio: {hintCost} crediti</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            aria-label="Apri informazioni sulla prova"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/18 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={infoDisabled}
            onClick={onInfoClick}
            title={infoDisabledReason || 'Apri informazioni sulla prova'}
            type="button"
          >
            i
          </button>

          <button
            aria-label={isVisible ? 'Apri indizio acquistato' : 'Acquista indizio'}
            className="flex h-10 min-w-10 items-center justify-center rounded-full border border-amber-300/30 bg-amber-400/10 px-3 text-sm font-semibold text-amber-50 transition hover:border-amber-200/60 hover:bg-amber-400/18 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={hintDisabled}
            onClick={onHintClick}
            title={hintDisabledReason || (isVisible ? 'Apri indizio acquistato' : 'Acquista indizio')}
            type="button"
          >
            <span aria-hidden="true">💡</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChallengeHintPanel