function ChallengeInfoModal({ isOpen, title, description, onClose }) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 px-4 py-6"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-[2rem] border border-cyan-300/20 bg-slate-950/95 p-6 shadow-[0_0_90px_rgba(34,211,238,0.10)] backdrop-blur-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/75">
              Info
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              {title || 'Dettagli prova'}
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
            {description || 'Nessuna informazione aggiuntiva disponibile per questa prova.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChallengeInfoModal