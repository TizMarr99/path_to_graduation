import { Link } from 'react-router-dom'

function ChallengeCompleted({ category, totalChallenges, onRestart }) {
  return (
    <section className="space-y-6 rounded-[2rem] border border-amber-300/20 bg-slate-950/75 p-8 shadow-[0_0_90px_rgba(8,145,178,0.08)] backdrop-blur-xl sm:p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/80">
          Sala rischiarata
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Hai attraversato {category.title}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          Le ombre si sono ricomposte. Hai superato tutte le {totalChallenges} prove attive di questa sala.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-400/20"
          onClick={onRestart}
          type="button"
        >
          Riapri la sala
        </button>
        <Link
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-amber-300/45 hover:text-amber-100"
          to="/dev"
        >
          Torna alla DevPage
        </Link>
      </div>
    </section>
  )
}

export default ChallengeCompleted