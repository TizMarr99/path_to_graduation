function HintModal({
  isOpen,
  hint,
  hintCost,
  credits,
  isHintVisible,
  canPurchaseHint,
  disabledReason,
  onClose,
  onReveal,
}) {
  if (!isOpen) {
    return null
  }

  const showCost = typeof hintCost === 'number'
  const isHintAvailable = Boolean(hint)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 px-4 py-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-[2rem] border border-amber-300/25 bg-slate-950/95 p-6 shadow-[0_0_90px_rgba(245,158,11,0.12)] backdrop-blur-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/75">
              Indizio
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              {isHintVisible ? 'Indizio sbloccato' : 'Vuoi comprare un indizio?'}
            </h2>
          </div>

          <button
            className="rounded-full border border-slate-700 bg-slate-950/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100"
            onClick={onClose}
            type="button"
          >
            Chiudi
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5">
          <p className="text-sm leading-7 text-slate-100/92">
            {isHintVisible
              ? (hint || 'Nessun indizio disponibile per questa prova.')
              : isHintAvailable
                ? 'Confermando l\'acquisto spenderai i crediti indicati e sbloccherai subito l\'indizio per questa prova.'
                : 'Nessun indizio disponibile per questa prova.'}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm leading-6 text-slate-300">
            {isHintVisible
              ? 'Indizio gia sbloccato'
              : showCost
                ? `Costo: ${hintCost} crediti`
                : 'Indizio gratuito'}
            {typeof credits === 'number' ? ` · Crediti disponibili: ${credits}` : ''}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {!isHintVisible ? (
              <button
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/85 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100"
                onClick={onClose}
                type="button"
              >
                Chiudi
              </button>
            ) : null}

            <button
              className="inline-flex items-center justify-center rounded-full border border-amber-300/35 bg-amber-400/12 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:border-amber-200/60 hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isHintVisible && !canPurchaseHint}
              onClick={isHintVisible ? onClose : onReveal}
              title={!isHintVisible ? (disabledReason || undefined) : undefined}
              type="button"
            >
              {isHintVisible ? 'Chiudi' : 'Compra indizio'}
            </button>
          </div>
        </div>

        {!isHintVisible && disabledReason ? (
          <p className="mt-3 text-sm leading-6 text-rose-200/85">{disabledReason}</p>
        ) : null}
      </div>
    </div>
  )
}

export default HintModal