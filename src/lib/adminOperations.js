import {
  buildDailyPayload, buildProgressPayload, createDefaultPlayerState,
  createDefaultRoomProgress, normalizeSnapshot,
} from './playerStateSnapshot.js'
import { createInitialDraftAnswerForChallenge, createInitialRuntimeStateForChallenge } from './challengeDraftState.js'

export const adminOperationLabels = {
  room: 'Azzera stanza', game: 'Ricomincia gioco', round: 'Riparti da un round',
  intro: 'Ripristina introduzione', access: 'Imposta accesso stanza',
  daily: 'Imposta limiti di oggi', position: 'Interrompi sessione e torna alla mappa',
  credits: 'Rettifica crediti', profile: 'Azzera profilo',
  movement: 'Annulla / ripristina movimento', restore: 'Ripristina stato precedente',
}

export function getResettableRounds(challenge) {
  // These formats store independent round input and a sequential cursor.
  return ['memory_palette', 'multi_round_quiz', 'progressive_clue_rounds'].includes(challenge?.type)
    && !challenge.simultaneousRounds ? challenge.rounds ?? [] : []
}

export function getAdminGames(category) {
  const groups = new Map()
  for (const challenge of category?.challenges ?? []) {
    const config = category.weightedScoring?.scoreGroups?.find((group) =>
      group.challengeIds?.includes(challenge.id) || group.quizTypes?.includes(challenge.quizSubType || challenge.type))
    const id = config?.id || challenge.quizSubType || challenge.type
    if (!groups.has(id)) groups.set(id, { id, title: config?.label || challenge.title, challenges: [] })
    groups.get(id).challenges.push(challenge)
  }
  return [...groups.values()]
}

export function getContextPlayerState(context) {
  const state = normalizeSnapshot(context.snapshot).playerState
  for (const archive of context.archives ?? []) {
    const room = state.roomProgress[archive.category_id]
    if (room) room.lastCompletedSession = archive.completed_snapshot
  }
  return state
}

function resetSessionChallenges(session, challengeIds, roundChallenge, roundId) {
  const next = structuredClone(session)
  for (const key of ['challengeResults', 'draftAnswersByChallengeId', 'challengeStatesByChallengeId']) {
    next[key] ??= {}
    for (const id of challengeIds) delete next[key][id]
  }
  next.currentChallengeId = challengeIds[0]
  delete next.draftAnswer
  delete next.challengeState
  next.isHintVisible = false
  delete next.outcomeSummary
  if (roundChallenge) {
    const rounds = getResettableRounds(roundChallenge)
    const index = rounds.findIndex((round) => round.id === roundId)
    if (index < 0) throw new Error('Seleziona un round valido.')
    const keepIds = new Set(rounds.slice(0, index).map((round) => round.id))
    const oldDraft = session.draftAnswersByChallengeId?.[roundChallenge.id] ?? {}
    const oldRuntime = session.challengeStatesByChallengeId?.[roundChallenge.id] ?? {}
    const draft = createInitialDraftAnswerForChallenge(roundChallenge)
    const runtime = createInitialRuntimeStateForChallenge(roundChallenge)
    for (const key of ['lockedRounds', 'memoryPaletteSelections', 'multiRoundAnswers', 'progressiveClueAnswers', 'roundChoiceOrders']) {
      draft[key] = Object.fromEntries(Object.entries(oldDraft[key] ?? {}).filter(([id]) => keepIds.has(id)))
    }
    draft.roundCursor = index
    for (const key of ['observationDeadlines', 'progressiveClueVisibleCounts']) {
      runtime[key] = Object.fromEntries(Object.entries(oldRuntime[key] ?? {}).filter(([id]) => keepIds.has(id)))
    }
    next.draftAnswersByChallengeId[roundChallenge.id] = draft
    next.challengeStatesByChallengeId[roundChallenge.id] = runtime
  }
  const results = Object.values(next.challengeResults)
  next.sessionCorrectCount = results.filter((result) => result.isCorrect).length
  next.sessionWrongCount = results.length - next.sessionCorrectCount
  next.correctCount = next.sessionCorrectCount
  next.wrongCount = next.sessionWrongCount
  delete next.completedAt
  return next
}

function moneyLine(label, movements, categoryId = null, challengeId = null) {
  return {
    label, source_ids: movements.map((row) => row.id),
    defaultDelta: -movements.reduce((sum, row) => sum + row.delta, 0),
    category_id: categoryId, challenge_id: challengeId,
  }
}

export function buildAdminPlan(context, categories, settings, checkpoint = null) {
  const state = getContextPlayerState(context)
  const next = structuredClone(state)
  const category = categories.find((item) => item.id === settings.categoryId)
  const game = getAdminGames(category).find((item) => item.id === settings.gameId)
  const operation = settings.operation
  const effects = []
  let moneyLines = []
  let archives = structuredClone(context.archives ?? [])
  let affectedIds = []
  const leaves = context.leaves ?? []
  const needsRoom = ['room', 'game', 'round', 'intro', 'access'].includes(operation)
  if (needsRoom && !category) throw new Error('Seleziona una stanza.')
  if (['game', 'round'].includes(operation) && !game) throw new Error('Seleziona un gioco.')
  const room = category ? next.roomProgress[category.id] ?? createDefaultRoomProgress(category.id) : null

  if (operation === 'profile') {
    Object.assign(next, createDefaultPlayerState(), {
      createdAt: state.createdAt, credits: state.credits,
      rewardState: state.rewardState, emailState: state.emailState,
    })
    archives = []
    effects.push('Tutte le stanze e le sessioni saranno azzerate; resterà accessibile Musica.', 'I limiti di oggi torneranno a 3 tentativi e 2 vite.')
  } else if (operation === 'room') {
    next.roomProgress[category.id] = createDefaultRoomProgress(category.id)
    if (settings.replayIntro) next.roomProgress[category.id].introSeen = false
    else {
      next.roomProgress[category.id].startedAt = room.startedAt
      next.roomProgress[category.id].introSeen = true
    }
    archives = archives.filter((archive) => archive.category_id !== category.id)
    if (next.activeSession?.categoryId === category.id || next.currentRoom === category.id) {
      next.activeSession = null
      next.currentRoom = null
      next.currentChallengeId = ''
    }
    effects.push(`Risultati, riepilogo e archivio di «${category.title}» saranno rimossi.`, 'Le altre stanze conserveranno accessi e risultati.')
  } else if (['game', 'round'].includes(operation)) {
    affectedIds = game.challenges.map((challenge) => challenge.id)
    const roundChallenge = operation === 'round' ? game.challenges.find((challenge) => challenge.id === settings.challengeId) : null
    if (operation === 'round') {
      if (!roundChallenge || !getResettableRounds(roundChallenge).length) throw new Error('Questo gioco non supporta il reset dei singoli round: ricomincia il gioco intero.')
      affectedIds = [roundChallenge.id]
    }
    const session = state.activeSession?.categoryId === category.id
      ? state.activeSession : room.lastCompletedSession
    if (!session) throw new Error('Non esiste una sessione recuperabile per questa stanza. Puoi azzerare la stanza intera.')
    if (state.activeSession && state.activeSession.categoryId !== category.id) {
      throw new Error('È attiva una sessione in un’altra stanza. Interrompila prima di riaprire questo gioco.')
    }
    next.activeSession = { ...resetSessionChallenges(session, affectedIds, roundChallenge, settings.roundId), categoryId: category.id }
    next.currentRoom = category.id
    next.currentChallengeId = affectedIds[0]
    next.roomProgress[category.id] = {
      ...room, completionCount: 0,
      totalResolvedChallenges: Object.keys(next.activeSession.challengeResults).length,
      lastSessionSummary: null, lastCompletedSession: null, lastOutcomeSummary: null,
      unlockedByScore: false, prizeWon: false, buyAccessAvailable: false,
      victoryModalSeen: false, archiveAvailable: false, sessions: [],
    }
    archives = archives.filter((archive) => archive.category_id !== category.id)
    effects.push(operation === 'round' ? 'Il round selezionato e tutti i successivi saranno riaperti, con timer nuovi.' : `Il gioco «${game.title}» verrà riaperto.`,
      'Gli altri giochi saranno conservati. Il risultato finale della stanza verrà ricalcolato quando sarà conclusa.',
      'Le altre stanze conserveranno accessi e risultati.')
  } else if (operation === 'intro') {
    next.roomProgress[category.id] = { ...room, introSeen: false }
    effects.push(`L’introduzione di «${category.title}» sarà mostrata al prossimo ingresso.`)
  } else if (operation === 'position') {
    next.activeSession = null
    next.currentRoom = null
    next.currentChallengeId = ''
    effects.push('La sessione in corso, comprese le risposte non archiviate, sarà rimossa. Il giocatore ripartirà dalla mappa.')
  } else if (operation === 'movement') {
    const source = leaves.find((row) => row.id === settings.movementId)
    if (!source || source.kind === 'opening') throw new Error('Movimento già modificato o non annullabile. Ricarica il profilo.')
    moneyLines = [moneyLine(source.is_effective ? 'Annullamento movimento' : 'Ripristino movimento', [source], source.category_id, source.challenge_id)]
    effects.push('Verrà registrato un movimento collegato all’originale; il progresso di gioco resterà invariato.')
  } else if (operation === 'restore') {
    if (!checkpoint) throw new Error('Seleziona un intervento dallo storico.')
    const bundle = checkpoint.before_state
    Object.assign(next, normalizeSnapshot(bundle.snapshot).playerState, { credits: state.credits })
    archives = structuredClone(bundle.archives)
    const desiredLeaves = new Map(bundle.leaves.map((row) => [row.root_id, row.is_effective]))
    const toReverse = leaves.filter((row) => row.kind !== 'opening' && row.is_effective !== (desiredLeaves.get(row.root_id) ?? false))
    moneyLines = [moneyLine('Ripristino dei movimenti allo stato precedente', toReverse)]
    moneyLines[0].defaultDelta = bundle.snapshot.progress.credits - state.credits
    effects.push(`Sarà ripristinato l’intero stato precedente a «${checkpoint.title}», sostituendo anche i progressi successivi.`, 'Le email già inviate resteranno registrate.')
  }

  if (['room', 'game', 'round', 'access'].includes(operation)) {
    const access = settings.access ?? 'keep'
    if (category.id === 'musica' && access === 'locked') throw new Error('Musica deve restare accessibile come stanza iniziale.')
    if (access === 'open') next.unlockedCategoryIds = [...new Set([...next.unlockedCategoryIds, category.id])]
    if (access === 'locked') {
      next.unlockedCategoryIds = next.unlockedCategoryIds.filter((id) => id !== category.id)
      if (next.activeSession?.categoryId === category.id) throw new Error('Per riaprire un gioco conserva o sblocca l’accesso alla stanza.')
    }
    effects.push(access === 'keep' ? 'L’accesso alla stanza resterà invariato.' : access === 'open' ? 'La stanza sarà accessibile senza acquisto.' : 'La stanza richiederà nuovamente lo sblocco previsto dal gioco.')
  }
  if (['room', 'game', 'round', 'access'].includes(operation)) {
    const pending = next.transitionState?.pendingBridge
    if (pending && [pending.sourceCategoryId, pending.targetCategoryId].includes(category.id)) {
      next.transitionState = { pendingBridge: null }
      effects.push('Il passaggio narrativo pendente collegato a questa stanza verrà rimosso.')
    }
  }
  if (settings.resetDaily || operation === 'daily') {
    if (operation === 'daily' && [settings.attempts, settings.lives].some((value) => String(value ?? '').trim() === '')) throw new Error('Compila vite e tentativi, anche quando valgono zero.')
    const attempts = operation === 'daily' ? Number(settings.attempts) : 3
    const lives = operation === 'daily' ? Number(settings.lives) : 2
    if (![attempts, lives].every((value) => Number.isSafeInteger(value) && value >= 0)) throw new Error('Vite e tentativi devono essere interi non negativi.')
    next.stats = { ...next.stats, attemptsRemaining: attempts, livesRemaining: lives }
    effects.push(`Limiti globali di oggi: ${attempts} tentativi e ${lives} vite, validi per tutte le stanze.`)
  }
  if (['room', 'game', 'round', 'profile'].includes(operation)) {
    const eligible = leaves.filter((row) => row.is_effective && row.kind !== 'opening' && (
      operation === 'profile' || (row.category_id === category.id && (
        operation === 'room' || affectedIds.includes(row.challenge_id)
      ))
    ) && (operation !== 'room' || (
      row.kind !== 'bundle_access' && (row.kind !== 'room_access' || settings.access === 'locked')
    )))
    moneyLines = [
      moneyLine('Rimozione crediti ottenuti', eligible.filter((row) => row.delta > 0), category?.id, affectedIds[0]),
      moneyLine('Restituzione crediti spesi', eligible.filter((row) => row.delta < 0), category?.id, affectedIds[0]),
    ]
    if (operation === 'profile') moneyLines.push({ label: 'Azzeramento saldo precedente al registro', source_ids: [], defaultDelta: -state.credits - moneyLines.reduce((sum, line) => sum + line.defaultDelta, 0) })
    effects.push('Gli importi proposti derivano solo dai movimenti registrati da quando è attivo lo storico. Puoi modificarli anche per compensare attività precedenti.')
    if (operation === 'room' && settings.access !== 'locked') effects.push('Il costo di un accesso che resta aperto non viene rimborsato automaticamente.')
  }
  if (operation === 'access') {
    const purchases = settings.access === 'locked'
      ? leaves.filter((row) => row.is_effective && row.kind === 'room_access' && row.category_id === category.id)
      : []
    moneyLines = [moneyLine('Rettifica crediti per accesso stanza', purchases, category.id)]
  }
  if (operation === 'credits') {
    if (String(settings.creditDelta ?? '').trim() === '') throw new Error('Inserisci una variazione crediti, anche quando vale zero.')
    const delta = Number(settings.creditDelta)
    if (!Number.isSafeInteger(delta)) throw new Error('Inserisci una variazione intera, positiva o negativa.')
    moneyLines = [{ label: 'Rettifica manuale', source_ids: [], defaultDelta: delta }]
    effects.push('Il progresso di gioco resterà invariato.')
  }
  if (!adminOperationLabels[operation]) throw new Error('Operazione non valida.')
  return {
    title: adminOperationLabels[operation], operation, effects,
    categoryId: category?.id ?? null, affectedIds,
    progress: buildProgressPayload(next), daily: buildDailyPayload(next), archives,
    moneyLines, originalCredits: state.credits, expectedRevision: context.snapshot.progress.state_revision,
    settings, restore_operation_id: checkpoint?.id ?? null,
  }
}

export function isOwnAdminProfile(actorCode, targetCode) {
  return typeof actorCode === 'string' && actorCode.trim().length > 0 && actorCode.trim() === targetCode?.trim()
}

export function finalizeAdminPlan(plan, amounts, reason, requestId, { actorCode, targetCode } = {}) {
  const resolvedReason = reason.trim() || (isOwnAdminProfile(actorCode, targetCode) ? 'Intervento sul proprio profilo' : '')
  if (!resolvedReason) throw new Error('Scrivi un motivo per ritrovare questo intervento nello storico.')
  const moneyLines = plan.moneyLines.map((line, index) => {
    const raw = amounts[index] ?? line.defaultDelta
    if (String(raw).trim() === '') throw new Error('Compila tutti gli importi, anche quando valgono zero.')
    const delta = Number(raw)
    if (!Number.isSafeInteger(delta)) throw new Error('Gli importi devono essere numeri interi.')
    return { ...line, delta }
  })
  const balance = plan.originalCredits + moneyLines.reduce((sum, line) => sum + line.delta, 0)
  if (!Number.isSafeInteger(balance) || balance < 0) throw new Error('Il saldo finale non può essere negativo. Modifica gli importi proposti.')
  return {
    request_id: requestId, expected_revision: plan.expectedRevision, title: plan.title,
    reason: resolvedReason, settings: plan.settings, money_lines: moneyLines,
    progress: { ...plan.progress, credits: balance }, daily: plan.daily, archives: plan.archives,
    restore_operation_id: plan.restore_operation_id,
  }
}
