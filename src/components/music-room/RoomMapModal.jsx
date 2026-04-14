function RoomMapModal({
  isOpen,
  category,
  currentZoneId,
  activeZoneIds,
  interactionDisabled,
  onClose,
  onSelectZone,
}) {
  if (!isOpen) {
    return null
  }

  const hotspots = category.mapHotspots ?? []


  return (
    <div
      className="fixed inset-0 z-[72] flex items-center justify-center bg-slate-950/90 px-3 py-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex w-full max-w-6xl max-h-[94vh] flex-col rounded-[2rem] border border-cyan-300/20 bg-slate-950/95 p-4 shadow-[0_0_90px_rgba(34,211,238,0.08)] backdrop-blur-xl">
        {/* Compact header row */}
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.38em] text-cyan-300/75">
              Mappa della sala
            </p>
            <h2 className="mt-0.5 text-base font-semibold tracking-tight text-white">
              {category.title}
            </h2>
          </div>
          <button
            className="shrink-0 rounded-full border border-slate-700 bg-slate-950/85 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100"
            onClick={onClose}
            type="button"
          >
            Chiudi
          </button>
        </div>

        {/* Body: map + legend, same height, no scroll */}
        <div className="flex min-h-0 flex-1 gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_17rem]">
          {/* Map column */}
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/35">
            {category.mapImage ? (
              <img
                alt={`Mappa di ${category.title}`}
                className="block w-full"
                src={category.mapImage}
              />
            ) : null}

            {hotspots.map((hotspot) => {
              const isActive = activeZoneIds.includes(hotspot.id)
              const isCurrent = currentZoneId === hotspot.id
              const xPct = hotspot.x + hotspot.width / 2
              const yPct = hotspot.y + hotspot.height / 2

              return (
                <button
                  key={hotspot.id}
                  className={[
                    'absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-base shadow-lg backdrop-blur-sm transition',
                    isCurrent
                      ? 'border-amber-200/80 bg-amber-300/30 shadow-[0_0_14px_rgba(251,191,36,0.35)]'
                      : isActive
                        ? 'border-cyan-300/60 bg-slate-900/70 hover:border-cyan-200/80 hover:bg-slate-800/80'
                        : 'border-slate-500/40 bg-slate-900/50 opacity-50',
                    interactionDisabled ? 'cursor-not-allowed' : '',
                  ].join(' ')}
                  disabled={interactionDisabled || !isActive}
                  onClick={() => onSelectZone(hotspot.id)}
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  title={hotspot.label}
                  type="button"
                >
                  {hotspot.icon || '•'}
                </button>
              )
            })}
          </div>

          {/* Legend column — stretches to map height, entries distribute evenly */}
          <div className="flex flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-3">
            <p className="mb-2 shrink-0 text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-slate-300/70">
              Zone attive
            </p>
            <div className="flex flex-1 flex-col gap-1.5 min-h-0">
              {hotspots.map((hotspot) => {
                const isEnabled = activeZoneIds.includes(hotspot.id)

                return (
                  <button
                    key={`${hotspot.id}-list`}
                    className={[
                      'flex flex-1 min-h-0 w-full items-center gap-2.5 rounded-xl border px-3 py-0 text-left transition',
                      currentZoneId === hotspot.id
                        ? 'border-amber-300/35 bg-amber-300/10'
                        : isEnabled
                          ? 'border-white/10 bg-slate-950/40 hover:border-cyan-300/35'
                          : 'border-white/5 bg-slate-950/25 opacity-55',
                    ].join(' ')}
                    disabled={interactionDisabled || !isEnabled}
                    onClick={() => onSelectZone(hotspot.id)}
                    type="button"
                  >
                    <span className="shrink-0 text-base leading-none">{hotspot.icon || '•'}</span>
                    <span className="block truncate text-sm font-semibold text-white">
                      {hotspot.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomMapModal