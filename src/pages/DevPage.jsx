import { getCategories } from '../lib/challengeData'
import { challengeTypeLabels } from '../lib/challengeRegistry'

const difficultyOrder = ['easy', 'medium', 'hard']
const templateOrder = [
  'multiple_choice',
  'free_text',
  'ordering',
  'multi_stage_progressive_reveal',
  'intruder',
  'sequence_reconstruction',
]

const difficultyLabels = {
  easy: 'Facili',
  medium: 'Medie',
  hard: 'Difficili',
}

function getDifficultyCounts(challenges = []) {
  return challenges.reduce(
    (counts, challenge) => {
      const difficulty = challenge.difficulty

      if (difficulty in counts) {
        counts[difficulty] += 1
      }

      return counts
    },
    { easy: 0, medium: 0, hard: 0 },
  )
}

function DevPage() {
  const templateTotals = templateOrder.reduce((counts, type) => {
    counts[type] = 0
    return counts
  }, {})

  const rows = getCategories().map((category) => ({
    id: category.id,
    kind: category.kind,
    title: category.title,
    ghost: category.ghost,
    counts: getDifficultyCounts(category.challenges),
    templates: category.challenges.reduce((counts, challenge) => {
      counts[challenge.type] = (counts[challenge.type] ?? 0) + 1
      templateTotals[challenge.type] = (templateTotals[challenge.type] ?? 0) + 1
      return counts
    }, {}),
  }))

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-amber-300/15 bg-slate-950/75 shadow-[0_0_90px_rgba(8,145,178,0.08)] backdrop-blur-xl">
        <div className="border-b border-slate-800 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/80">
                DevPage
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Verifica locale di categories.json
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Questa vista importa il JSON locale, lo normalizza nel dominio challenge e riassume ogni sala per controllare rapidamente struttura, metadati e distribuzione delle prove.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Categorie</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-100">{rows.length}</p>
              </div>
              {difficultyOrder.map((difficulty) => {
                const total = rows.reduce(
                  (sum, row) => sum + row.counts[difficulty],
                  0,
                )

                return (
                  <div
                    key={difficulty}
                    className="rounded-2xl border border-amber-300/15 bg-amber-300/8 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-100/75">
                      {difficultyLabels[difficulty]}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-amber-50">{total}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {templateOrder.map((type) => (
              <div
                key={type}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  {challengeTypeLabels[type]}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {templateTotals[type] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-900/80">
              <tr className="text-xs uppercase tracking-[0.28em] text-slate-400">
                <th className="px-6 py-4 font-medium sm:px-8">ID</th>
                <th className="px-6 py-4 font-medium sm:px-8">Kind</th>
                <th className="px-6 py-4 font-medium sm:px-8">Titolo</th>
                <th className="px-6 py-4 font-medium sm:px-8">Fantasma</th>
                {difficultyOrder.map((difficulty) => (
                  <th key={difficulty} className="px-6 py-4 font-medium sm:px-8">
                    {difficultyLabels[difficulty]}
                  </th>
                ))}
                <th className="px-6 py-4 font-medium sm:px-8">Template</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-slate-950/40 transition hover:bg-slate-900/80"
                >
                  <td className="px-6 py-5 align-top text-sm font-medium text-cyan-100 sm:px-8">
                    {row.id}
                  </td>
                  <td className="px-6 py-5 align-top sm:px-8">
                    <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                      {row.kind}
                    </span>
                  </td>
                  <td className="px-6 py-5 align-top sm:px-8">
                    <p className="text-sm font-semibold text-white">{row.title}</p>
                  </td>
                  <td className="px-6 py-5 align-top sm:px-8">
                    <p className="text-sm text-slate-300">{row.ghost}</p>
                  </td>
                  {difficultyOrder.map((difficulty) => (
                    <td key={difficulty} className="px-6 py-5 align-top sm:px-8">
                      <span className="inline-flex min-w-12 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-sm font-semibold text-amber-100">
                        {row.counts[difficulty]}
                      </span>
                    </td>
                  ))}
                  <td className="px-6 py-5 align-top sm:px-8">
                    <div className="flex flex-wrap gap-2">
                      {templateOrder
                        .filter((type) => row.templates[type])
                        .map((type) => (
                          <span
                            key={type}
                            className="inline-flex rounded-full border border-slate-700 bg-slate-900/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
                          >
                            {challengeTypeLabels[type]}: {row.templates[type]}
                          </span>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default DevPage