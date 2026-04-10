function ReorderableList({ items, disabled, onMove }) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => {
        const isFirst = index === 0
        const isLast = index === items.length - 1

        return (
          <li
            key={item.id}
            className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/10 text-sm font-semibold text-amber-100">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              {item.description ? (
                <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <button
                className="rounded-full border border-slate-700 bg-slate-950/85 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled || isFirst}
                onClick={() => onMove(index, index - 1)}
                type="button"
              >
                Su
              </button>
              <button
                className="rounded-full border border-slate-700 bg-slate-950/85 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled || isLast}
                onClick={() => onMove(index, index + 1)}
                type="button"
              >
                Giu
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default ReorderableList