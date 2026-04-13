import { useMemo, useState } from 'react'
import { getCategories } from '../lib/challengeData'
import { usePlayerState } from '../hooks/usePlayerState'
import { isDevToolsEnabled } from '../lib/runtimeFlags.js'
import { challengeTypeLabels } from '../lib/challengeRegistry'

const difficultyOrder = ['easy', 'medium', 'hard']
const templateOrder = [
  'multiple_choice',
  'free_text',
  'ordering',
  'multi_stage_progressive_reveal',
  'intruder',
  'sequence_reconstruction',
  'guess_title_author',
  'face_morph',
  'fill_lyrics',
  'musical_chain',
  'hitster',
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
  const [resetMessage, setResetMessage] = useState('')
  const [targetCode, setTargetCode] = useState('')
  const [isAdminActionRunning, setIsAdminActionRunning] = useState(false)
  const {
    accessCode,
    playerState,
    role,
    resetDailyCounters,
    resetDailyCountersForCode,
    resetCurrentPosition,
    resetPlayerState,
    resetPlayerStateForCode,
    resetMusicRoomIntro,
    syncError,
  } = usePlayerState()
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
  const unlockedRooms = useMemo(
    () => playerState.unlockedCategoryIds.length,
    [playerState.unlockedCategoryIds],
  )

  function handleResetDailyCounters() {
    resetDailyCounters()
    setResetMessage('Contatori sessione azzerati.')
  }

  function handleResetAll() {
    resetPlayerState()
    setResetMessage('Stato giocatore azzerato completamente.')
  }

  function handleResetCurrentPosition() {
    resetCurrentPosition()
    setResetMessage('Posizione corrente azzerata. Il profilo ripartira dalla mappa.')
  }

  function handleResetMusicIntro() {
    resetMusicRoomIntro()
    setResetMessage('Intro della sala musica ripristinata.')
  }

  async function handleAdminDailyReset() {
    const normalizedTargetCode = targetCode.trim()

    if (!normalizedTargetCode) {
      setResetMessage('Inserisci il codice del player da resettare.')
      return
    }

    setIsAdminActionRunning(true)
    const result = await resetDailyCountersForCode(normalizedTargetCode)
    setIsAdminActionRunning(false)

    if (result.ok) {
      setResetMessage(`Contatori giornalieri azzerati per il codice ${normalizedTargetCode}.`)
    }
  }

  async function handleAdminFullReset() {
    const normalizedTargetCode = targetCode.trim()

    if (!normalizedTargetCode) {
      setResetMessage('Inserisci il codice del player da resettare.')
      return
    }

    setIsAdminActionRunning(true)
    const result = await resetPlayerStateForCode(normalizedTargetCode)
    setIsAdminActionRunning(false)

    if (result.ok) {
      setResetMessage(`Profilo azzerato per il codice ${normalizedTargetCode}.`)
    }
  }

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

          <div className="mt-5 rounded-[1.5rem] border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
                  Player state
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Strumenti di reset sul profilo corrente autenticato. In questa prima integrazione le azioni agiscono sullo snapshot associato al codice con cui hai effettuato l'accesso.
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Ruolo attivo: {role || 'non disponibile'}
                </p>
              </div>

              {isDevToolsEnabled ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/18"
                    onClick={handleResetDailyCounters}
                    type="button"
                  >
                    Azzera contatori sessione
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-full border border-violet-300/35 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:border-violet-200/60 hover:bg-violet-400/18"
                    onClick={handleResetCurrentPosition}
                    type="button"
                  >
                    Reset posizione corrente
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-full border border-amber-300/35 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-200/60 hover:bg-amber-300/18"
                    onClick={handleResetMusicIntro}
                    type="button"
                  >
                    Reset intro musica
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-full border border-rose-300/35 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-200/60 hover:bg-rose-400/18"
                    onClick={handleResetAll}
                    type="button"
                  >
                    Reset totale giocatore
                  </button>
                </div>
              ) : (
                <span className="inline-flex rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Reset disponibile solo in dev
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Crediti</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-100">{playerState.credits}</p>
              </div>
              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-100/75">Quiz tentati</p>
                <p className="mt-2 text-2xl font-semibold text-amber-50">{playerState.stats.quizzesAttempted}</p>
              </div>
              <div className="rounded-2xl border border-rose-300/15 bg-rose-300/8 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-100/75">Errori oggi</p>
                <p className="mt-2 text-2xl font-semibold text-rose-50">{playerState.stats.wrongAnswersToday}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sale sbloccate</p>
                <p className="mt-2 text-2xl font-semibold text-white">{unlockedRooms}</p>
              </div>
            </div>

            {resetMessage ? (
              <p className="mt-4 text-sm font-medium text-emerald-300">{resetMessage}</p>
            ) : null}
            {syncError ? (
              <p className="mt-2 text-sm font-medium text-rose-300">{syncError}</p>
            ) : null}
          </div>

          {role === 'admin' ? (
            <div className="mt-5 rounded-[1.5rem] border border-violet-300/15 bg-violet-400/8 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/80">
                    Admin tools
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                    Inserisci il codice del player target per azzerare i contatori del giorno o resettare completamente il profilo. Il reset posizione fine-grained e disponibile solo per il profilo attualmente autenticato.
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    Codice admin attivo: {accessCode || 'non disponibile'}
                  </p>
                </div>

                <label className="block min-w-[16rem]" htmlFor="admin-target-code">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-violet-100/80">
                    Codice player target
                  </span>
                  <input
                    autoComplete="off"
                    className="mt-3 w-full rounded-full border border-violet-300/35 bg-slate-950/80 px-5 py-3 text-sm font-medium tracking-[0.25em] text-violet-50 outline-none transition focus:border-violet-200 focus:ring-2 focus:ring-violet-300/20"
                    id="admin-target-code"
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) => setTargetCode(event.target.value)}
                    placeholder="310119"
                    value={targetCode}
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/18 disabled:cursor-wait disabled:opacity-70"
                  disabled={isAdminActionRunning}
                  onClick={() => void handleAdminDailyReset()}
                  type="button"
                >
                  {isAdminActionRunning ? 'Operazione in corso...' : 'Reset daily target'}
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-rose-300/35 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-200/60 hover:bg-rose-400/18 disabled:cursor-wait disabled:opacity-70"
                  disabled={isAdminActionRunning}
                  onClick={() => void handleAdminFullReset()}
                  type="button"
                >
                  {isAdminActionRunning ? 'Operazione in corso...' : 'Reset totale target'}
                </button>
              </div>
            </div>
          ) : null}

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