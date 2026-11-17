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
      <div className="flex w-full max-w-7xl max-h-[94dvh] flex-col rounded-[1.5rem] border border-cyan-300/20 bg-slate-950/95 p-4 shadow-[0_0_90px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-5">
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

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(15rem,19rem)] lg:overflow-hidden">
          {/* Map column */}
          <div className="relative self-start overflow-hidden rounded-[1rem] bg-black/35">
            {category.mapImage ? (
              <img
                alt={`Mappa di ${category.title}`}
                className="block h-auto w-full"
                src={category.mapImage}
              />
            ) : null}

            {hotspots.map((hotspot, index) => {
              const isActive = activeZoneIds.includes(hotspot.id)
              const isCurrent = currentZoneId === hotspot.id
              const xPct = hotspot.x + hotspot.width / 2
              const yPct = hotspot.y + hotspot.height / 2

              return (
                <button
                  key={hotspot.id}
                  className={[
                    'absolute flex h-8 min-w-8 max-w-[24%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border px-1.5 py-1 text-[0.65rem] font-semibold leading-tight shadow-lg backdrop-blur-md transition sm:h-auto sm:min-h-10 sm:px-3 sm:text-xs',
                    isCurrent
                      ? 'border-amber-200/80 bg-amber-950/90 text-amber-50 shadow-[0_0_14px_rgba(251,191,36,0.35)]'
                      : isActive
                        ? 'border-cyan-300/60 bg-slate-950/85 text-white hover:border-cyan-200/80 hover:bg-slate-800/90'
                        : 'border-slate-500/40 bg-slate-900/65 text-slate-300 opacity-60',
                    interactionDisabled ? 'cursor-not-allowed' : '',
                  ].join(' ')}
                  disabled={interactionDisabled || !isActive}
                  onClick={() => onSelectZone(hotspot.id)}
                  style={{ left: `${xPct}%`, top: `${yPct}%` }}
                  aria-label={hotspot.label}
                  title={hotspot.label}
                  type="button"
                >
                  <span className="text-amber-200" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="ml-1 hidden truncate sm:inline">{hotspot.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex min-h-0 flex-col rounded-[1rem] bg-white/[0.04] p-3 sm:p-4">
            <p className="mb-3 shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              Scegli una zona
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:overflow-y-auto">
              {hotspots.map((hotspot, index) => {
                const isEnabled = activeZoneIds.includes(hotspot.id)

                return (
                  <button
                    key={`${hotspot.id}-list`}
                    className={[
                      'flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition disabled:cursor-not-allowed',
                      currentZoneId === hotspot.id
                        ? 'border-amber-300/55 bg-amber-300/15'
                        : isEnabled
                          ? 'border-white/10 bg-slate-950/55 hover:border-cyan-300/50 hover:bg-cyan-300/10'
                          : 'border-white/5 bg-slate-950/25 opacity-55',
                    ].join(' ')}
                    disabled={interactionDisabled || !isEnabled}
                    onClick={() => onSelectZone(hotspot.id)}
                    type="button"
                  >
                    <span className="shrink-0 text-xs font-bold tracking-widest text-amber-200" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <span className="block text-sm font-semibold leading-snug text-white">
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
