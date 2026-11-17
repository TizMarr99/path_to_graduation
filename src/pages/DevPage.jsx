import AdminPlayerPanel from '../components/admin/AdminPlayerPanel.jsx'
import { getCategories } from '../lib/challengeData'
import { challengeTypeLabels } from '../lib/challengeRegistry'

function DevPage() {
  return <div className="space-y-6">
    <AdminPlayerPanel />
    <details className="rounded-3xl border border-slate-700 bg-slate-950/75 p-5 sm:p-7">
      <summary className="cursor-pointer text-lg font-semibold text-white">Inventario dei contenuti</summary>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {getCategories().map((category) => {
          const types = category.challenges.reduce((counts, challenge) => ({ ...counts, [challenge.type]: (counts[challenge.type] ?? 0) + 1 }), {})
          return <article key={category.id} className="rounded-2xl border border-slate-700 p-4">
            <h2 className="font-semibold text-cyan-100">{category.title}</h2>
            <p className="mt-1 text-xs text-slate-400">{category.id} · {category.challenges.length} prove</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-300">{Object.entries(types).map(([type, count]) => <li key={type}>{challengeTypeLabels[type] || type}: {count}</li>)}</ul>
          </article>
        })}
      </div>
    </details>
  </div>
}

export default DevPage
