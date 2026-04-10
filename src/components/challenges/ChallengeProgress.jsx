import { challengeTypeLabels } from '../../lib/challengeRegistry'

function ChallengeProgress({ challengeNumber, totalChallenges, difficulty, type }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
          Stato sessione
        </p>
        <p className="mt-2 text-lg font-semibold text-white">
          Prova {challengeNumber} di {totalChallenges}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
          Difficolta {difficulty}
        </span>
        <span className="inline-flex w-fit items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100">
          {challengeTypeLabels[type] ?? type}
        </span>
      </div>
    </div>
  )
}

export default ChallengeProgress