function ChallengeLayout({ category, progressLabel, children }) {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-950/75 shadow-[0_0_90px_rgba(8,145,178,0.08)] backdrop-blur-xl">
        <div className="border-b border-slate-800 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/80">
                Sala attiva
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {category.title}
              </h2>
              <p className="mt-3 text-sm uppercase tracking-[0.25em] text-cyan-200/75">
                Presenza: {category.ghost}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                {category.description}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-300/15 bg-amber-300/8 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-100/75">Progresso</p>
              <p className="mt-2 text-xl font-semibold text-amber-50">{progressLabel}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </section>
  )
}

export default ChallengeLayout