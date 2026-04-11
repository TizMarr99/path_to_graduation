function ChallengeLayout({ category, progressLabel, credits, attemptsRemaining, livesRemaining, children }) {
  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-950/75 shadow-[0_0_90px_rgba(8,145,178,0.08)] backdrop-blur-xl">
        <div className="border-b border-slate-800 px-6 py-4 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/80">
                {category.title}
              </p>
              <p className="mt-1 text-sm uppercase tracking-[0.25em] text-cyan-200/75">
                {category.ghost}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {typeof credits === 'number' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-sm font-semibold text-amber-50">
                  <span className="text-amber-300">🪙</span> {credits}
                </span>
              ) : null}

              {typeof attemptsRemaining === 'number' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-400/8 px-3 py-1.5 text-sm font-semibold text-cyan-50">
                  🎯 {attemptsRemaining} tent.
                </span>
              ) : null}

              {typeof livesRemaining === 'number' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-400/8 px-3 py-1.5 text-sm font-semibold text-rose-50">
                  ❤️ {livesRemaining}
                </span>
              ) : null}

              <span className="inline-flex items-center rounded-full border border-amber-300/15 bg-amber-300/8 px-3 py-1.5 text-sm font-semibold text-amber-50">
                {progressLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 sm:px-8 sm:py-6">{children}</div>
      </div>
    </section>
  )
}

export default ChallengeLayout