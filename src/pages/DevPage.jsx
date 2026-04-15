import { useMemo, useState } from 'react'
import { getCategories } from '../lib/challengeData'
import { usePlayerState } from '../hooks/usePlayerState'
import {
  applyAdminStateOverrides,
  buildDailyPayload,
  buildProgressPayload,
  getAttemptsRemaining,
  getLivesRemaining,
  normalizeSnapshot,
  resetCurrentPositionInPlayerState,
  resetMusicRoomIntroInPlayerState,
} from '../lib/playerStateSnapshot'
import { appGetSnapshot, appSaveSnapshot } from '../lib/supabaseGameApi'
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

function parseOptionalWholeNumber(value) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return undefined
  }

  const parsedValue = Number(normalizedValue)

  if (!Number.isFinite(parsedValue)) {
    return undefined
  }

  return Math.max(0, Math.trunc(parsedValue))
}

function getErrorMessage(error, fallbackMessage) {
  return error?.userMessage ?? error?.message ?? fallbackMessage
}

function StatCard({ accentClassName, detail, label, value }) {
  return (
    <div className={accentClassName}>
      <p className="text-xs uppercase tracking-[0.3em]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-2 text-xs tracking-[0.16em] opacity-75">{detail}</p> : null}
    </div>
  )
}

function NumericField({ accentClassName, id, label, onChange, placeholder, value }) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={id}>
      <span className={`text-[0.68rem] font-semibold uppercase tracking-[0.28em] ${accentClassName}`}>
        {label}
      </span>
      <input
        className="w-28 rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm font-semibold text-slate-50 outline-none transition focus:border-cyan-300/60"
        id={id}
        inputMode="numeric"
        min={0}
        onChange={onChange}
        placeholder={placeholder}
        type="number"
        value={value}
      />
    </label>
  )
}

function DevPage() {
  const [currentMessage, setCurrentMessage] = useState('')
  const [targetCodeInput, setTargetCodeInput] = useState('')
  const [loadedTargetCode, setLoadedTargetCode] = useState('')
  const [targetMessage, setTargetMessage] = useState('')
  const [isAdminActionRunning, setIsAdminActionRunning] = useState(false)
  const [isTargetLoading, setIsTargetLoading] = useState(false)
  const [isTargetSaving, setIsTargetSaving] = useState(false)
  const [currentCreditsInput, setCurrentCreditsInput] = useState('')
  const [currentAttemptsRemainingInput, setCurrentAttemptsRemainingInput] = useState('')
  const [currentLivesRemainingInput, setCurrentLivesRemainingInput] = useState('')
  const [targetCreditsInput, setTargetCreditsInput] = useState('')
  const [targetAttemptsRemainingInput, setTargetAttemptsRemainingInput] = useState('')
  const [targetLivesRemainingInput, setTargetLivesRemainingInput] = useState('')
  const [targetPlayerState, setTargetPlayerState] = useState(null)
  const [targetRole, setTargetRole] = useState('')
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
    setAdminStats,
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
  const currentAttemptsRemaining = getAttemptsRemaining(playerState)
  const currentLivesRemaining = getLivesRemaining(playerState)
  const targetUnlockedRooms = targetPlayerState?.unlockedCategoryIds.length ?? 0
  const targetAttemptsRemaining = targetPlayerState ? getAttemptsRemaining(targetPlayerState) : 0
  const targetLivesRemaining = targetPlayerState ? getLivesRemaining(targetPlayerState) : 0
  const targetControlsDisabled =
    !targetPlayerState || isTargetLoading || isTargetSaving || isAdminActionRunning

  function resetCurrentInputs() {
    setCurrentCreditsInput('')
    setCurrentAttemptsRemainingInput('')
    setCurrentLivesRemainingInput('')
  }

  function resetTargetInputs() {
    setTargetCreditsInput('')
    setTargetAttemptsRemainingInput('')
    setTargetLivesRemainingInput('')
  }

  async function loadTargetPlayer(code, successMessage = '') {
    setIsTargetLoading(true)
    setTargetMessage('')

    try {
      const snapshot = await appGetSnapshot(code)
      const normalized = normalizeSnapshot(snapshot)

      setLoadedTargetCode(code)
      setTargetRole(normalized.role)
      setTargetPlayerState(normalized.playerState)
      resetTargetInputs()
      setTargetMessage(successMessage || `Profilo ${code} caricato.`)

      return { ok: true, normalized }
    } catch (error) {
      setLoadedTargetCode('')
      setTargetRole('')
      setTargetPlayerState(null)
      setTargetMessage(getErrorMessage(error, 'Impossibile caricare il player selezionato.'))
      return { ok: false, error }
    } finally {
      setIsTargetLoading(false)
    }
  }

  async function saveTargetPlayer(nextPlayerState, successMessage) {
    if (!loadedTargetCode) {
      return { ok: false }
    }

    setIsTargetSaving(true)
    setTargetMessage('')

    try {
      await appSaveSnapshot(
        loadedTargetCode,
        buildProgressPayload(nextPlayerState),
        buildDailyPayload(nextPlayerState),
      )
      setTargetPlayerState(nextPlayerState)
      resetTargetInputs()
      setTargetMessage(successMessage)

      return { ok: true }
    } catch (error) {
      setTargetMessage(getErrorMessage(error, 'Impossibile salvare il player selezionato.'))
      return { ok: false, error }
    } finally {
      setIsTargetSaving(false)
    }
  }

  function handleResetDailyCounters() {
    resetDailyCounters()
    setCurrentMessage('Contatori giornalieri del tuo profilo azzerati.')
  }

  function handleResetAll() {
    resetPlayerState()
    setCurrentMessage('Profilo corrente azzerato completamente.')
  }

  function handleResetCurrentPosition() {
    resetCurrentPosition()
    setCurrentMessage('Posizione corrente azzerata. Il profilo ripartira dalla mappa.')
  }

  function handleResetMusicIntro() {
    resetMusicRoomIntro()
    setCurrentMessage('Intro della sala musica ripristinata sul tuo profilo.')
  }

  function handleApplyCurrentValues() {
    const credits = parseOptionalWholeNumber(currentCreditsInput)
    const attemptsRemaining = parseOptionalWholeNumber(currentAttemptsRemainingInput)
    const livesRemaining = parseOptionalWholeNumber(currentLivesRemainingInput)

    if (
      typeof credits !== 'number' &&
      typeof attemptsRemaining !== 'number' &&
      typeof livesRemaining !== 'number'
    ) {
      setCurrentMessage('Inserisci almeno un valore da aggiornare.')
      return
    }

    setAdminStats({
      credits,
      attemptsRemaining,
      livesRemaining,
    })
    resetCurrentInputs()
    setCurrentMessage('Valori del tuo profilo aggiornati.')
  }

  async function handleLoadTargetPlayer() {
    const normalizedTargetCode = targetCodeInput.trim()

    if (!normalizedTargetCode) {
      setTargetMessage('Inserisci il codice del player da caricare.')
      return
    }

    if (normalizedTargetCode === accessCode) {
      setLoadedTargetCode('')
      setTargetRole('')
      setTargetPlayerState(null)
      setTargetMessage('Per il tuo profilo usa il pannello Player state sopra.')
      return
    }

    await loadTargetPlayer(normalizedTargetCode)
  }

  async function handleAdminDailyReset() {
    if (!loadedTargetCode) {
      setTargetMessage('Carica prima un player target.')
      return
    }

    setIsAdminActionRunning(true)
    const result = await resetDailyCountersForCode(loadedTargetCode)
    setIsAdminActionRunning(false)

    if (result.ok) {
      await loadTargetPlayer(
        loadedTargetCode,
        `Contatori giornalieri azzerati per il codice ${loadedTargetCode}.`,
      )
    }
  }

  async function handleAdminFullReset() {
    if (!loadedTargetCode) {
      setTargetMessage('Carica prima un player target.')
      return
    }

    setIsAdminActionRunning(true)
    const result = await resetPlayerStateForCode(loadedTargetCode)
    setIsAdminActionRunning(false)

    if (result.ok) {
      await loadTargetPlayer(loadedTargetCode, `Profilo azzerato per il codice ${loadedTargetCode}.`)
    }
  }

  async function handleTargetResetCurrentPosition() {
    if (!targetPlayerState || !loadedTargetCode) {
      setTargetMessage('Carica prima un player target.')
      return
    }

    const nextPlayerState = resetCurrentPositionInPlayerState(targetPlayerState)
    await saveTargetPlayer(
      nextPlayerState,
      `Posizione corrente azzerata per il codice ${loadedTargetCode}.`,
    )
  }

  async function handleTargetResetMusicIntro() {
    if (!targetPlayerState || !loadedTargetCode) {
      setTargetMessage('Carica prima un player target.')
      return
    }

    const nextPlayerState = resetMusicRoomIntroInPlayerState(targetPlayerState)
    await saveTargetPlayer(
      nextPlayerState,
      `Intro musica ripristinata per il codice ${loadedTargetCode}.`,
    )
  }

  async function handleApplyTargetValues() {
    if (!targetPlayerState || !loadedTargetCode) {
      setTargetMessage('Carica prima un player target.')
      return
    }

    const credits = parseOptionalWholeNumber(targetCreditsInput)
    const attemptsRemaining = parseOptionalWholeNumber(targetAttemptsRemainingInput)
    const livesRemaining = parseOptionalWholeNumber(targetLivesRemainingInput)

    if (
      typeof credits !== 'number' &&
      typeof attemptsRemaining !== 'number' &&
      typeof livesRemaining !== 'number'
    ) {
      setTargetMessage('Inserisci almeno un valore da aggiornare sul player target.')
      return
    }

    const nextPlayerState = applyAdminStateOverrides(targetPlayerState, {
      credits,
      attemptsRemaining,
      livesRemaining,
    })

    await saveTargetPlayer(nextPlayerState, `Valori aggiornati per il codice ${loadedTargetCode}.`)
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
                Portale admin per dataset e player state
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                La pagina e disponibile per l&apos;utenza admin autenticata. Qui puoi controllare il dataset locale e intervenire sia sul tuo profilo sia su un player target caricato per codice.
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
                  Strumenti sul profilo admin autenticato. Tentativi e vite vengono impostati in termini di risorse rimaste oggi, non di consumi gia registrati.
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Ruolo attivo: {role || 'non disponibile'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/18"
                  onClick={handleResetDailyCounters}
                  type="button"
                >
                  Reset giornaliero
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
                  Reset totale profilo
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                accentClassName="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-3 text-cyan-100"
                label="Crediti"
                value={playerState.credits}
              />
              <StatCard
                accentClassName="rounded-2xl border border-amber-300/15 bg-amber-300/8 px-4 py-3 text-amber-50"
                label="Tentativi rimasti"
                value={currentAttemptsRemaining}
              />
              <StatCard
                accentClassName="rounded-2xl border border-rose-300/15 bg-rose-300/8 px-4 py-3 text-rose-50"
                label="Vite rimaste"
                value={currentLivesRemaining}
              />
              <StatCard
                accentClassName="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white"
                label="Sale sbloccate"
                value={unlockedRooms}
              />
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-cyan-300/15 bg-cyan-400/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/75">
                Imposta valori profilo corrente
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <NumericField
                  accentClassName="text-cyan-100/70"
                  id="current-credits"
                  label="Crediti"
                  onChange={(event) => setCurrentCreditsInput(event.target.value)}
                  placeholder={String(playerState.credits)}
                  value={currentCreditsInput}
                />
                <NumericField
                  accentClassName="text-amber-100/70"
                  id="current-attempts-remaining"
                  label="Tentativi rimasti"
                  onChange={(event) => setCurrentAttemptsRemainingInput(event.target.value)}
                  placeholder={String(currentAttemptsRemaining)}
                  value={currentAttemptsRemainingInput}
                />
                <NumericField
                  accentClassName="text-rose-100/70"
                  id="current-lives-remaining"
                  label="Vite rimaste"
                  onChange={(event) => setCurrentLivesRemainingInput(event.target.value)}
                  placeholder={String(currentLivesRemaining)}
                  value={currentLivesRemainingInput}
                />
                <button
                  className="inline-flex items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/10 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/18"
                  onClick={handleApplyCurrentValues}
                  type="button"
                >
                  Applica
                </button>
              </div>
            </div>

            {currentMessage ? (
              <p className="mt-4 text-sm font-medium text-emerald-300">{currentMessage}</p>
            ) : null}
            {syncError ? (
              <p className="mt-2 text-sm font-medium text-rose-300">{syncError}</p>
            ) : null}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-violet-300/15 bg-violet-400/8 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/80">
                  Admin tools
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Carica un player tramite codice e poi controlla tutto il suo stato: reset giornaliero, reset completo, reset intro musica, reset posizione corrente e valori custom di crediti, tentativi rimasti e vite rimaste.
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Codice admin attivo: {accessCode || 'non disponibile'}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-[20rem] sm:flex-row sm:items-end">
                <label className="block sm:flex-1" htmlFor="admin-target-code">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-violet-100/80">
                    Codice player target
                  </span>
                  <input
                    autoComplete="off"
                    className="mt-3 w-full rounded-full border border-violet-300/35 bg-slate-950/80 px-5 py-3 text-sm font-medium tracking-[0.25em] text-violet-50 outline-none transition focus:border-violet-200 focus:ring-2 focus:ring-violet-300/20"
                    id="admin-target-code"
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) => setTargetCodeInput(event.target.value)}
                    placeholder="310119"
                    value={targetCodeInput}
                  />
                </label>
                <button
                  className="inline-flex items-center justify-center rounded-full border border-violet-200/40 bg-violet-300/12 px-5 py-3 text-sm font-semibold text-violet-50 transition hover:border-violet-100/70 hover:bg-violet-300/18 disabled:cursor-wait disabled:opacity-70"
                  disabled={isTargetLoading}
                  onClick={() => void handleLoadTargetPlayer()}
                  type="button"
                >
                  {isTargetLoading ? 'Caricamento...' : 'Carica player'}
                </button>
              </div>
            </div>

            {targetPlayerState ? (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    accentClassName="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-4 py-3 text-cyan-100"
                    label="Crediti target"
                    value={targetPlayerState.credits}
                  />
                  <StatCard
                    accentClassName="rounded-2xl border border-amber-300/15 bg-amber-300/8 px-4 py-3 text-amber-50"
                    label="Tentativi rimasti"
                    value={targetAttemptsRemaining}
                  />
                  <StatCard
                    accentClassName="rounded-2xl border border-rose-300/15 bg-rose-300/8 px-4 py-3 text-rose-50"
                    label="Vite rimaste"
                    value={targetLivesRemaining}
                  />
                  <StatCard
                    accentClassName="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white"
                    detail={targetRole ? `ruolo ${targetRole}` : undefined}
                    label="Sale sbloccate"
                    value={targetUnlockedRooms}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/18 disabled:cursor-wait disabled:opacity-70"
                    disabled={targetControlsDisabled}
                    onClick={() => void handleAdminDailyReset()}
                    type="button"
                  >
                    Reset giornaliero target
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-full border border-violet-300/35 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:border-violet-200/60 hover:bg-violet-400/18 disabled:cursor-wait disabled:opacity-70"
                    disabled={targetControlsDisabled}
                    onClick={() => void handleTargetResetCurrentPosition()}
                    type="button"
                  >
                    Reset posizione target
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-full border border-amber-300/35 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-200/60 hover:bg-amber-300/18 disabled:cursor-wait disabled:opacity-70"
                    disabled={targetControlsDisabled}
                    onClick={() => void handleTargetResetMusicIntro()}
                    type="button"
                  >
                    Reset intro musica target
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-full border border-rose-300/35 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-200/60 hover:bg-rose-400/18 disabled:cursor-wait disabled:opacity-70"
                    disabled={targetControlsDisabled}
                    onClick={() => void handleAdminFullReset()}
                    type="button"
                  >
                    Reset totale target
                  </button>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-violet-300/15 bg-violet-300/6 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-violet-100/80">
                    Imposta valori target
                  </p>
                  <div className="flex flex-wrap items-end gap-3">
                    <NumericField
                      accentClassName="text-cyan-100/70"
                      id="target-credits"
                      label="Crediti"
                      onChange={(event) => setTargetCreditsInput(event.target.value)}
                      placeholder={String(targetPlayerState.credits)}
                      value={targetCreditsInput}
                    />
                    <NumericField
                      accentClassName="text-amber-100/70"
                      id="target-attempts-remaining"
                      label="Tentativi rimasti"
                      onChange={(event) => setTargetAttemptsRemainingInput(event.target.value)}
                      placeholder={String(targetAttemptsRemaining)}
                      value={targetAttemptsRemainingInput}
                    />
                    <NumericField
                      accentClassName="text-rose-100/70"
                      id="target-lives-remaining"
                      label="Vite rimaste"
                      onChange={(event) => setTargetLivesRemainingInput(event.target.value)}
                      placeholder={String(targetLivesRemaining)}
                      value={targetLivesRemainingInput}
                    />
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-violet-200/40 bg-violet-300/12 px-5 py-2 text-sm font-semibold text-violet-50 transition hover:border-violet-100/70 hover:bg-violet-300/18 disabled:cursor-wait disabled:opacity-70"
                      disabled={targetControlsDisabled}
                      onClick={() => void handleApplyTargetValues()}
                      type="button"
                    >
                      Applica valori target
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            {targetMessage ? (
              <p className="mt-4 text-sm font-medium text-emerald-300">{targetMessage}</p>
            ) : null}
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
