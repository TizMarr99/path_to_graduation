function ChallengeHintPanel({ hint, isVisible, onReveal, disabled }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Indizio
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {isVisible ? hint : 'Puoi rivelare un aiuto contestuale per questa prova.'}
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || isVisible}
          onClick={onReveal}
          type="button"
        >
          {isVisible ? 'Indizio visibile' : 'Mostra indizio'}
        </button>
      </div>
    </div>
  )
}

export default ChallengeHintPanel