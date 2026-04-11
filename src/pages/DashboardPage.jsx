import { Link } from 'react-router-dom'
import { usePlayerState } from '../hooks/usePlayerState'
import { getCategories } from '../lib/challengeData'

const musicUnlockTargets = ['ritratto-spezzato', 'archivio-vivente']

const galleryFrameStyles = {
  unlocked:
    'border-amber-300/30 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.10),_transparent_60%),rgba(2,6,23,0.78)] shadow-[0_0_60px_rgba(212,175,55,0.08)]',
  locked:
    'border-slate-700/50 bg-slate-950/60 shadow-[0_0_40px_rgba(15,23,42,0.3)]',
}

function RoomFrame({ category, isUnlocked, roomProgress }) {
  const lastSession = roomProgress?.sessions?.at(-1) ?? null

  return (
    <article
      className={[
        'group relative flex flex-col overflow-hidden rounded-[2rem] border backdrop-blur-xl transition-all duration-500',
        isUnlocked ? galleryFrameStyles.unlocked : galleryFrameStyles.locked,
      ].join(' ')}
    >
      {/* Ornate gold frame top border */}
      <div
        className={[
          'h-1.5 w-full',
          isUnlocked
            ? 'bg-gradient-to-r from-transparent via-amber-300/40 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-600/30 to-transparent',
        ].join(' ')}
      />

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        {isUnlocked ? (
          <>
            <div
              className="relative mb-5 flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/15 bg-slate-900/50 sm:h-52"
            >
              <div className="relative z-10 text-center">
                <p className="text-4xl opacity-80 sm:text-5xl">
                  {category.id === 'musica' ? '🎵' : category.id === 'ritratto-spezzato' ? '🖼️' : '📚'}
                </p>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-amber-200/78">
                {category.type === 'room' ? 'Sala' : 'Gioco secondario'}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-amber-50 sm:text-2xl">
                {category.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-300 line-clamp-2">
                {category.description}
              </p>
              {category.ghost ? (
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-cyan-200/60">
                  Presenza: {category.ghost}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <div className="relative mb-5 flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-slate-700/40 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.08),_transparent_45%),rgba(15,23,42,0.9)] sm:h-52">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.82),rgba(2,6,23,0.96))]" />
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:34px_34px]" />
              <div className="relative z-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-600/70 bg-slate-900/90 text-3xl text-slate-300">
                  ?
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
                  Opera velata
                </p>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                Accesso nascosto
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-300 sm:text-2xl">
                Sala sigillata
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                I dettagli della stanza restano celati finché non la sblocchi.
              </p>
            </div>
          </>
        )}

        {/* Score placard */}
        {isUnlocked && lastSession ? (
          <div className="mt-4 flex gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Esito
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {lastSession.passed ? '✓ Superata' : '✗ Non superata'}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Punteggio
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {lastSession.correctCount}/{lastSession.totalChallenges}
              </p>
            </div>
          </div>
        ) : null}

        {/* CTAs */}
        <div className="mt-5 flex flex-wrap gap-2">
          {isUnlocked ? (
            <Link
              className="inline-flex items-center justify-center rounded-full border border-amber-300/50 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:border-amber-200/75 hover:bg-amber-300/18"
              to={`/play/${category.id}`}
            >
              Entra nella sala
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-400">
              Accesso sigillato
            </span>
          )}
        </div>
      </div>

      {/* Ornate gold frame bottom border */}
      <div
        className={[
          'h-1.5 w-full',
          isUnlocked
            ? 'bg-gradient-to-r from-transparent via-amber-300/40 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-600/30 to-transparent',
        ].join(' ')}
      />
    </article>
  )
}

function DashboardPage() {
  const { playerState, getRoomProgress, getCredits, buyCategoryBundle } = usePlayerState()
  const categories = getCategories()
  const credits = getCredits()
  const musicProgress = getRoomProgress('musica')
  const lockedBundleIds = musicUnlockTargets.filter(
    (categoryId) => !playerState.unlockedCategoryIds.includes(categoryId),
  )
  const bundleCost = categories
    .filter((category) => lockedBundleIds.includes(category.id))
    .reduce((sum, category) => sum + (category.buyAccessCost ?? 0), 0)
  const hasCompletedMusicRoom = Boolean(musicProgress?.sessions?.length)
  const canBuyBundle = Boolean(musicProgress?.buyAccessAvailable && lockedBundleIds.length)

  function handleBundleUnlock() {
    if (!canBuyBundle) return
    buyCategoryBundle(lockedBundleIds, bundleCost)
  }

  return (
    <section className="space-y-8">
      {/* Gallery header */}
      <div className="overflow-hidden rounded-[2rem] border border-amber-300/12 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.10),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(8,145,178,0.08),_transparent_28%),rgba(2,6,23,0.82)] p-8 shadow-[0_0_80px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/78">
              Galleria d'arte
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Le sale del percorso
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Ogni quadro incorniciato rappresenta una sala da esplorare. Le opere velate
              restano anonime finché non completi la sala musica o non ottieni lo sblocco anticipato.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/8 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/75">Crediti</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-amber-50">
              <span className="text-amber-300">🪙</span> {credits}
            </p>
          </div>
        </div>
      </div>

      {canBuyBundle ? (
        <div className="rounded-[1.75rem] border border-cyan-300/20 bg-cyan-400/8 p-6 shadow-[0_0_60px_rgba(8,145,178,0.08)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">
                Sblocco congiunto disponibile
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-cyan-50/90">
                Hai completato tutti e 12 i quiz della sala musica senza raggiungere 8/12. Ora puoi sbloccare insieme le due nuove sale.
              </p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-full border border-cyan-200/40 bg-cyan-300/12 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-100/60 hover:bg-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={credits < bundleCost}
              onClick={handleBundleUnlock}
              type="button"
            >
              Sblocca entrambe le sale ({bundleCost} 🪙)
            </button>
          </div>
        </div>
      ) : null}

      {!canBuyBundle && lockedBundleIds.length && !hasCompletedMusicRoom ? (
        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/60 p-6 backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Sblocco delle nuove sale
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Per accedere alle due nuove stanze devi prima completare tutti i 12 quiz della sala musica. L'unico sblocco anticipato resta il risultato di almeno 8/12.
          </p>
        </div>
      ) : null}

      {/* Gallery grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const isUnlocked = playerState.unlockedCategoryIds.includes(category.id)
          const roomProgress = getRoomProgress(category.id)

          return (
            <RoomFrame
              key={category.id}
              category={category}
              isUnlocked={isUnlocked}
              roomProgress={roomProgress}
            />
          )
        })}
      </div>
    </section>
  )
}

export default DashboardPage
