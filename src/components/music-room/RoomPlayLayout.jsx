function FearVisualOverlay({ fearId, isActive }) {
  if (!isActive) {
    return null
  }

  if (fearId === 'horror-musica') {
    return (
      <>
        {/* Subtle red flicker flash — fixed so it covers modals too */}
        <div
          className="pointer-events-none fixed inset-0 z-[80] horror-flicker"
          style={{ background: 'radial-gradient(circle at center, rgba(190,10,10,0.42) 0%, rgba(60,0,0,0.28) 45%, rgba(2,6,23,0.70) 100%)' }}
        />
        {/* Scanline texture */}
        <div className="pointer-events-none fixed inset-0 z-[80] opacity-15 [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0_1px,transparent_1px_10px),repeating-linear-gradient(90deg,rgba(239,68,68,0.04)_0_1px,transparent_1px_12px)]" />
      </>
    )
  }

  return null
}

function RoomPlayLayout({
  category,
  progressLabel,
  credits,
  attemptsRemaining,
  livesRemaining,
  banner,
  isFearActive,
  onInfoClick,
  onHintClick,
  onMapClick,
  infoDisabled,
  infoDisabledReason,
  hintDisabled,
  hintDisabledReason,
  mapDisabled,
  mapDisabledReason,
  children,
}) {
  const backgroundImage = category.backgroundImage || null
  const fear = category.fear

  return (
    <section className="relative min-h-screen overflow-hidden text-amber-50">
      {backgroundImage ? (
        <img alt={category.title} className="absolute inset-0 h-full w-full object-cover" src={backgroundImage} />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.85)_0%,rgba(2,6,23,0.50)_35%,rgba(2,6,23,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.10),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.08),_transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />
      <FearVisualOverlay fearId={fear?.id} isActive={isFearActive} />

      <div className={['relative z-20 flex min-h-screen flex-col', isFearActive ? 'horror-shake' : ''].join(' ')}>
        {/* Top header bar */}
        <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/60 px-5 py-3 backdrop-blur-xl sm:px-7">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.42em] text-amber-200/60">
              Sala
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
              {category.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-sm font-semibold text-amber-50">
              <span className="text-amber-300">🪙</span> {credits}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-400/8 px-3 py-1.5 text-sm font-semibold text-cyan-50">
              🎯 {attemptsRemaining} tent.
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-400/8 px-3 py-1.5 text-sm font-semibold text-rose-50">
              ❤️ {livesRemaining}
            </span>
            <button
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/55 hover:bg-cyan-400/18 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={mapDisabled}
              onClick={onMapClick}
              title={mapDisabledReason || undefined}
              type="button"
            >
              🗺️ <span className="ml-1 hidden sm:inline">Mappa</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-5xl xl:max-w-6xl">
            {banner ? <div className="mb-4">{banner}</div> : null}
            {children}
          </div>
        </div>

        {/* Bottom bar: hint circle + progress */}
        <div className="flex items-center gap-3 border-t border-white/10 bg-slate-950/55 px-5 py-3 backdrop-blur-xl sm:px-7">
          <button
            aria-label="Apri informazioni sulla prova"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-sm font-bold text-cyan-100 transition hover:border-cyan-200/55 hover:bg-cyan-400/18 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={infoDisabled}
            onClick={onInfoClick}
            title={infoDisabledReason || 'Apri informazioni sulla prova'}
            type="button"
          >
            i
          </button>

          <button
            aria-label="Apri indizio"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-400/10 text-base font-bold text-amber-50 transition hover:border-amber-200/55 hover:bg-amber-400/18 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={hintDisabled}
            onClick={onHintClick}
            title={hintDisabledReason || 'Usa un indizio'}
            type="button"
          >
            💡
          </button>
          <span className="text-sm text-slate-300">{progressLabel}</span>
        </div>
      </div>
    </section>
  )
}

export default RoomPlayLayout