import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPlayerSaveQueue } from '../lib/playerSaveQueue.js'
import {
  appGetRoomArchive,
  appGetSnapshot,
  appLogin,
  appSaveSnapshot,
} from '../lib/supabaseGameApi'
import {
  buildRoomArchivePayload,
  createDefaultPlayerState,
  createDefaultRoomProgress,
  normalizeSnapshot,
} from '../lib/playerStateSnapshot'

const PlayerStateContext = createContext(null)
const ACCESS_CODE_STORAGE_KEY = 'path-to-graduation:access-code'
const MUSIC_ENABLED_STORAGE_KEY = 'path-to-graduation:music-enabled'
const VIP_ACCESS_STORAGE_KEY = 'path-to-graduation:vip-access'
const SAVE_DEBOUNCE_MS = 900

function withCreditMovement(state, delta, context = {}) {
  if (!delta) return state
  return {
    ...state,
    _creditMovements: [...(state._creditMovements ?? []), {
      id: crypto.randomUUID(), delta,
      kind: context.kind ?? (delta > 0 ? 'bonus' : 'spend'),
      label: context.label ?? (delta > 0 ? 'Crediti ottenuti' : 'Crediti spesi'),
      category_id: context.categoryId ?? state.currentRoom ?? null,
      challenge_id: context.challengeId !== undefined ? context.challengeId : state.currentChallengeId || null,
    }],
  }
}

function loadStoredAccessCode() {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    return window.localStorage.getItem(ACCESS_CODE_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function persistStoredAccessCode(code) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ACCESS_CODE_STORAGE_KEY, code)
}

function clearStoredAccessCode() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ACCESS_CODE_STORAGE_KEY)
}

function clearStoredVipAccess() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(VIP_ACCESS_STORAGE_KEY)
}

function clearPersistedAccessArtifacts() {
  clearStoredAccessCode()
  clearStoredVipAccess()
}

function loadStoredMusicEnabled() {
  if (typeof window === 'undefined') {
    return true
  }

  try {
    return window.localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

function persistStoredMusicEnabled(isEnabled) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, isEnabled ? 'true' : 'false')
}

function areSerializableSnapshotsEqual(leftValue, rightValue) {
  try {
    return JSON.stringify(leftValue) === JSON.stringify(rightValue)
  } catch {
    return false
  }
}

function getFallbackErrorMessage(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage
  }

  return error.userMessage ?? error.message ?? fallbackMessage
}

function isMissingArchiveRpcError(error) {
  const message = `${error?.message ?? ''} ${error?.details ?? ''} ${error?.hint ?? ''}`.toLowerCase()

  return (
    message.includes('app_save_room_archive') ||
    message.includes('app_get_room_archive') ||
    message.includes('app_clear_room_archives') ||
    message.includes('could not find the function') ||
    (message.includes('function') && message.includes('does not exist'))
  )
}

function markRoomArchiveAvailableInState(playerState, categoryId) {
  const previousProgress =
    playerState.roomProgress[categoryId] ?? createDefaultRoomProgress(categoryId)

  return {
    ...playerState,
    roomProgress: {
      ...playerState.roomProgress,
      [categoryId]: {
        ...previousProgress,
        archiveAvailable: true,
      },
    },
  }
}

function mergeRoomArchiveIntoState(playerState, categoryId, archive) {
  const completedSnapshot = archive?.completed_snapshot ?? archive?.completedSnapshot ?? null

  if (!completedSnapshot || typeof completedSnapshot !== 'object' || Array.isArray(completedSnapshot)) {
    return playerState
  }

  const summary = archive?.summary && typeof archive.summary === 'object' && !Array.isArray(archive.summary)
    ? archive.summary
    : {}
  const previousProgress =
    playerState.roomProgress[categoryId] ?? createDefaultRoomProgress(categoryId)

  return {
    ...playerState,
    roomProgress: {
      ...playerState.roomProgress,
      [categoryId]: {
        ...previousProgress,
        completionCount: summary.completionCount ?? previousProgress.completionCount,
        totalResolvedChallenges:
          summary.totalResolvedChallenges ?? previousProgress.totalResolvedChallenges,
        lastSessionSummary: summary.lastSessionSummary ?? previousProgress.lastSessionSummary,
        lastCompletedSession: completedSnapshot,
        lastOutcomeSummary: summary.lastOutcomeSummary ?? previousProgress.lastOutcomeSummary,
        unlockedByScore: summary.unlockedByScore ?? previousProgress.unlockedByScore,
        prizeWon: summary.prizeWon ?? previousProgress.prizeWon,
        buyAccessAvailable: summary.buyAccessAvailable ?? previousProgress.buyAccessAvailable,
        archiveAvailable: true,
      },
    },
  }
}

function getResumePathForState(playerState) {
  const activeSession = playerState.activeSession
  const pendingBridge = playerState.transitionState?.pendingBridge

  if (activeSession?.categoryId) {
    const params = new URLSearchParams()

    if (activeSession.currentChallengeId) {
      params.set('challenge', activeSession.currentChallengeId)
    }

    const queryString = params.toString()

    return `/play/${activeSession.categoryId}${queryString ? `?${queryString}` : ''}`
  }

  if (pendingBridge && !pendingBridge.bridgeCompletedAt) {
    return '/bridge'
  }

  return '/shadows'
}

function shouldShowHomeIntroForState(playerState) {
  return !playerState.lastPlayedAt && Object.keys(playerState.roomProgress).length === 0
}

export function PlayerStateProvider({ children }) {
  const [playerState, setPlayerState] = useState(createDefaultPlayerState)
  const [accessCode, setAccessCode] = useState(loadStoredAccessCode)
  const [role, setRole] = useState('')
  const [accessCodeId, setAccessCodeId] = useState('')
  const [isHydrating, setIsHydrating] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isMusicEnabled, setIsMusicEnabledState] = useState(loadStoredMusicEnabled)
  const [authError, setAuthError] = useState('')
  const [syncError, setSyncError] = useState('')
  const playerStateRef = useRef(playerState)
  const accessCodeRef = useRef(accessCode)
  const debouncedSaveTimeoutRef = useRef(null)
  const [persistence] = useState(() => createPlayerSaveQueue({
    save: appSaveSnapshot,
    onSyncing: setIsSyncing,
    onError(error) { setSyncError(error ? getFallbackErrorMessage(error, 'Impossibile salvare il progresso.') : '') },
    onSaved(snapshot, acknowledged, archived) {
      const current = {
        ...playerStateRef.current, stateRevision: snapshot.progress.state_revision,
        _creditMovements: (playerStateRef.current._creditMovements ?? []).filter((row) => !acknowledged.has(row.id)),
        _roomArchives: (playerStateRef.current._roomArchives ?? []).filter((row) => !archived.has(row.id)),
      }
      playerStateRef.current = current
      setPlayerState(current)
    },
  }))

  useEffect(() => {
    playerStateRef.current = playerState
  }, [playerState])

  useEffect(() => {
    accessCodeRef.current = accessCode
  }, [accessCode])

  useEffect(() => {
    persistStoredMusicEnabled(isMusicEnabled)
  }, [isMusicEnabled])

  useEffect(() => {
    return () => {
      if (debouncedSaveTimeoutRef.current) {
        window.clearTimeout(debouncedSaveTimeoutRef.current)
      }
    }
  }, [])

  const applySnapshot = useCallback((snapshot, nextCode = accessCodeRef.current) => {
    const normalized = normalizeSnapshot(snapshot)

    playerStateRef.current = normalized.playerState
    accessCodeRef.current = nextCode
    persistence.reset(nextCode, normalized.playerState.stateRevision)

    setPlayerState(normalized.playerState)
    setRole(normalized.role)
    setAccessCodeId(normalized.accessCodeId)
    setAccessCode(nextCode)

    return normalized
  }, [persistence])

  const clearScheduledSave = useCallback(() => {
    if (debouncedSaveTimeoutRef.current) {
      window.clearTimeout(debouncedSaveTimeoutRef.current)
      debouncedSaveTimeoutRef.current = null
    }
  }, [])

  const resetLocalSession = useCallback(() => {
    clearPersistedAccessArtifacts()
    clearScheduledSave()

    const defaultPlayerState = createDefaultPlayerState()

    playerStateRef.current = defaultPlayerState
    accessCodeRef.current = ''
    persistence.reset('', 0)

    setPlayerState(defaultPlayerState)
    setRole('')
    setAccessCodeId('')
    setAccessCode('')
    setAuthError('')
    setSyncError('')
  }, [clearScheduledSave, persistence])

  useEffect(() => {
    let isMounted = true

    async function bootstrapSession() {
      if (!accessCodeRef.current) {
        if (isMounted) {
          setIsHydrating(false)
        }
        return
      }

      try {
        const snapshot = await appGetSnapshot(accessCodeRef.current)

        if (!isMounted) {
          return
        }

        applySnapshot(snapshot, accessCodeRef.current)
      } catch {
        if (!isMounted) {
          return
        }

        resetLocalSession()
      } finally {
        if (isMounted) {
          setIsHydrating(false)
        }
      }
    }

    void bootstrapSession()

    return () => {
      isMounted = false
    }
  }, [applySnapshot, resetLocalSession])

  function buildRoomOutcomePlayerState(currentState, {
    categoryId,
    challengeResults = {},
    challengeStatesByChallengeId = {},
    correctCount,
    draftAnswersByChallengeId = {},
    wrongCount,
    totalChallenges,
    passedOverride,
    outcomeSummary = null,
    unlockedCategoryIds = [],
  }) {
    const passed = typeof passedOverride === 'boolean' ? passedOverride : correctCount >= 8
    const previousProgress =
      currentState.roomProgress[categoryId] ?? createDefaultRoomProgress(categoryId)
    const startedAt = previousProgress.startedAt ?? Date.now()
    const nextSessionSummary = {
      categoryId,
      startedAt,
      completedAt: Date.now(),
      correctCount,
      wrongCount,
      totalChallenges,
      passed,
      unlockedCategoryIds: passed ? unlockedCategoryIds : [],
      prizeAwarded: passed,
      outcomeSummary,
    }

    return {
      ...currentState,
      roomProgress: {
        ...currentState.roomProgress,
        [categoryId]: {
          ...previousProgress,
          startedAt,
          sessions: [],
          completionCount: (previousProgress.completionCount ?? previousProgress.sessions?.length ?? 0) + 1,
          totalResolvedChallenges:
            (previousProgress.totalResolvedChallenges ?? 0) + correctCount + wrongCount,
          lastSessionSummary: nextSessionSummary,
          lastCompletedSession:
            correctCount + wrongCount > 0
              ? {
                  challengeResults,
                  challengeStatesByChallengeId,
                  completedAt: Date.now(),
                  currentChallengeId: Object.keys(challengeResults)[0] ?? '',
                  correctCount,
                  draftAnswersByChallengeId,
                  totalChallenges,
                  wrongCount,
                  outcomeSummary,
                }
              : previousProgress.lastCompletedSession ?? null,
          lastOutcomeSummary: outcomeSummary ?? previousProgress.lastOutcomeSummary ?? null,
          unlockedByScore: previousProgress.unlockedByScore || passed,
          prizeWon: previousProgress.prizeWon || passed,
          buyAccessAvailable: !passed && correctCount + wrongCount >= totalChallenges,
        },
      },
      unlockedCategoryIds: passed
        ? Array.from(new Set([...currentState.unlockedCategoryIds, ...unlockedCategoryIds]))
        : currentState.unlockedCategoryIds,
      currentRoom: null,
      currentChallengeId: '',
      activeSession: null,
      lastPlayedAt: new Date().toISOString(),
    }
  }

  const persistPlayerState = useCallback((state, options) => persistence.enqueue(state, options), [persistence])

  async function flushPlayerState() {
    const scheduled = Boolean(debouncedSaveTimeoutRef.current)
    clearScheduledSave()
    await persistence.wait()
    if (persistence.blocked) return { ok: false }
    const state = playerStateRef.current
    if (scheduled || persistence.hasFailedPacket || state._creditMovements?.length || state._roomArchives?.length) return persistPlayerState(state)
    return { ok: true }
  }

  async function refreshPlayerState(snapshot = null) {
    clearScheduledSave()
    await persistence.wait()
    const code = accessCodeRef.current
    if (!code) return
    applySnapshot(snapshot ?? await appGetSnapshot(code), code)
    setSyncError('')
  }

  const commitPlayerState = useCallback((nextPlayerState, { persist = 'immediate' } = {}) => {
    playerStateRef.current = nextPlayerState
    setPlayerState(nextPlayerState)

    if (!accessCodeRef.current || persist === 'none') {
      return nextPlayerState
    }

    clearScheduledSave()

    if (persist === 'debounced') {
      debouncedSaveTimeoutRef.current = window.setTimeout(() => {
        debouncedSaveTimeoutRef.current = null
        void persistPlayerState(nextPlayerState, { silent: true })
      }, SAVE_DEBOUNCE_MS)

      return nextPlayerState
    }

    void persistPlayerState(nextPlayerState)
    return nextPlayerState
  }, [clearScheduledSave, persistPlayerState])

  const updatePlayerState = useCallback((updater, options) => {
    const currentState = playerStateRef.current
    const nextPlayerState = typeof updater === 'function' ? updater(currentState) : updater

    if (nextPlayerState === currentState) {
      return currentState
    }

    return commitPlayerState(nextPlayerState, options)
  }, [commitPlayerState])

  async function login(nextCode) {
    const normalizedCode = nextCode.trim()

    if (!normalizedCode) {
      const message = 'Inserisci il codice personale.'
      setAuthError(message)
      return { ok: false, message }
    }

    setIsLoggingIn(true)
    setAuthError('')

    try {
      const snapshot = await appLogin(normalizedCode)
      const normalized = applySnapshot(snapshot, normalizedCode)

      persistStoredAccessCode(normalizedCode)

      return {
        ok: true,
        playerState: normalized.playerState,
        role: normalized.role,
        resumePath: getResumePathForState(normalized.playerState),
        shouldShowHomeIntro: shouldShowHomeIntroForState(normalized.playerState),
      }
    } catch (error) {
      const message = getFallbackErrorMessage(error, 'Accesso non riuscito.')

      resetLocalSession()
      setAuthError(message)

      return { ok: false, message, error }
    } finally {
      setIsLoggingIn(false)
      setIsHydrating(false)
    }
  }

  function logout() {
    resetLocalSession()
  }

  function clearAuthFeedback() {
    setAuthError('')
  }

  function clearSyncFeedback() {
    setSyncError('')
  }

  const setMusicEnabled = useCallback((nextValue) => {
    setIsMusicEnabledState(Boolean(nextValue))
  }, [])

  const toggleMusicEnabled = useCallback(() => {
    setIsMusicEnabledState((currentValue) => !currentValue)
  }, [])

  function unlockCategories(categoryIds = []) {
    if (!categoryIds.length) {
      return
    }

    updatePlayerState(
      (currentState) => ({
        ...currentState,
        unlockedCategoryIds: Array.from(
          new Set([...currentState.unlockedCategoryIds, ...categoryIds]),
        ),
      }),
      { persist: 'debounced' },
    )
  }

  const registerRoomOutcome = useCallback(async ({
    categoryId,
    challengeResults = {},
    challengeStatesByChallengeId = {},
    correctCount,
    draftAnswersByChallengeId = {},
    wrongCount,
    totalChallenges,
    passedOverride,
    outcomeSummary = null,
    unlockedCategoryIds = [],
  }) => {
    let nextPlayerState = buildRoomOutcomePlayerState(playerStateRef.current, {
      categoryId,
      challengeResults,
      challengeStatesByChallengeId,
      correctCount,
      draftAnswersByChallengeId,
      wrongCount,
      totalChallenges,
      passedOverride,
      outcomeSummary,
      unlockedCategoryIds,
    })

    const archivePayload = buildRoomArchivePayload(nextPlayerState, categoryId)
    if (archivePayload) {
      nextPlayerState = markRoomArchiveAvailableInState(nextPlayerState, categoryId)
      nextPlayerState._roomArchives = [...(nextPlayerState._roomArchives ?? []), {
        id: crypto.randomUUID(), categoryId, archive: archivePayload,
      }]
    }

    playerStateRef.current = nextPlayerState
    setPlayerState(nextPlayerState)
    if (!accessCodeRef.current) return { ok: true }
    clearScheduledSave()
    return persistPlayerState(nextPlayerState)
  }, [clearScheduledSave, persistPlayerState])

  function addCredits(amount, context) {
    if (amount <= 0) {
      return
    }

    updatePlayerState(
      (currentState) => withCreditMovement({
        ...currentState,
        credits: currentState.credits + amount,
        lastPlayedAt: new Date().toISOString(),
      }, amount, context),
      { persist: 'debounced' },
    )
  }

  function applyChallengeFeedbackOutcome({ awardedCredits = 0, consumeLife = false, categoryId, challengeId, challengeTitle }) {
    if (awardedCredits <= 0 && !consumeLife) {
      return
    }

    updatePlayerState(
      (currentState) => withCreditMovement({
        ...currentState,
        credits: currentState.credits + Math.max(0, awardedCredits),
        stats: {
          ...currentState.stats,
          livesRemaining: consumeLife
            ? Math.max(0, currentState.stats.livesRemaining - 1)
            : currentState.stats.livesRemaining,
        },
        lastPlayedAt: new Date().toISOString(),
      }, Math.max(0, awardedCredits), { kind: 'challenge_reward', label: challengeTitle ? `Ricompensa: ${challengeTitle}` : 'Ricompensa gioco', categoryId, challengeId }),
      { persist: 'debounced' },
    )
  }

  function spendCredits(amount, context) {
    if (amount <= 0) {
      return true
    }

    const currentState = playerStateRef.current

    if (currentState.credits < amount) {
      return false
    }

    updatePlayerState(
      withCreditMovement({
        ...currentState,
        credits: currentState.credits - amount,
        lastPlayedAt: new Date().toISOString(),
      }, -amount, context),
      { persist: 'debounced' },
    )

    return true
  }

  function registerQuizAttempt() {
    updatePlayerState(
      (currentState) => ({
        ...currentState,
        stats: {
          ...currentState.stats,
          attemptsRemaining: Math.max(0, currentState.stats.attemptsRemaining - 1),
        },
        lastPlayedAt: new Date().toISOString(),
      }),
      { persist: 'debounced' },
    )
  }

  function registerWrongAnswer() {
    updatePlayerState(
      (currentState) => ({
        ...currentState,
        stats: {
          ...currentState.stats,
          livesRemaining: Math.max(0, currentState.stats.livesRemaining - 1),
        },
        lastPlayedAt: new Date().toISOString(),
      }),
      { persist: 'debounced' },
    )
  }

  const loadRoomArchive = useCallback(async (categoryId) => {
    if (!accessCodeRef.current || !categoryId) {
      return { ok: false }
    }

    const currentProgress = playerStateRef.current.roomProgress[categoryId]

    if (currentProgress?.lastCompletedSession) {
      return { ok: true, fromCache: true }
    }

    setSyncError('')

    try {
      const archive = await appGetRoomArchive(accessCodeRef.current, categoryId)
      const nextPlayerState = mergeRoomArchiveIntoState(
        playerStateRef.current,
        categoryId,
        archive,
      )

      playerStateRef.current = nextPlayerState
      setPlayerState(nextPlayerState)

      return { ok: true, archive }
    } catch (error) {
      if (!isMissingArchiveRpcError(error) && error?.message !== 'ROOM_ARCHIVE_NOT_FOUND') {
        setSyncError(getFallbackErrorMessage(error, "Impossibile recuperare l'archivio della stanza."))
      }

      return { ok: false, error }
    }
  }, [])

  function markRoomStarted(categoryId, challengeId = '', introSeen = false) {
    updatePlayerState(
      (currentState) => {
        const previousProgress =
          currentState.roomProgress[categoryId] ?? createDefaultRoomProgress(categoryId)

        return {
          ...currentState,
          roomProgress: {
            ...currentState.roomProgress,
            [categoryId]: {
              ...previousProgress,
              startedAt: previousProgress.startedAt ?? Date.now(),
              introSeen: introSeen ? true : previousProgress.introSeen,
            },
          },
          currentRoom: categoryId,
          currentChallengeId: challengeId || currentState.currentChallengeId,
          lastPlayedAt: new Date().toISOString(),
        }
      },
      { persist: 'debounced' },
    )
  }

  function markRoomIntroSeen(categoryId) {
    if (!categoryId) {
      return
    }

    markRoomStarted(categoryId, '', true)
  }

  function queuePendingBridge({ sourceCategoryId, targetCategoryId }) {
    if (!sourceCategoryId || !targetCategoryId) {
      return
    }

    updatePlayerState(
      (currentState) => {
        const currentPendingBridge = currentState.transitionState?.pendingBridge ?? null

        if (
          currentPendingBridge?.sourceCategoryId === sourceCategoryId &&
          currentPendingBridge?.targetCategoryId === targetCategoryId
        ) {
          return currentState
        }

        return {
          ...currentState,
          transitionState: {
            pendingBridge: {
              sourceCategoryId,
              targetCategoryId,
              createdAt: new Date().toISOString(),
              bridgeCompletedAt: null,
            },
          },
          lastPlayedAt: new Date().toISOString(),
        }
      },
      { persist: 'immediate' },
    )
  }

  function markPendingBridgeSeen() {
    updatePlayerState(
      (currentState) => {
        const currentPendingBridge = currentState.transitionState?.pendingBridge ?? null

        if (!currentPendingBridge || currentPendingBridge.bridgeCompletedAt) {
          return currentState
        }

        return {
          ...currentState,
          transitionState: {
            pendingBridge: {
              ...currentPendingBridge,
              bridgeCompletedAt: new Date().toISOString(),
            },
          },
          lastPlayedAt: new Date().toISOString(),
        }
      },
      { persist: 'immediate' },
    )
  }

  function clearPendingBridge(targetCategoryId) {
    updatePlayerState(
      (currentState) => {
        const currentPendingBridge = currentState.transitionState?.pendingBridge ?? null

        if (!currentPendingBridge) {
          return currentState
        }

        if (targetCategoryId && currentPendingBridge.targetCategoryId !== targetCategoryId) {
          return currentState
        }

        return {
          ...currentState,
          transitionState: {
            pendingBridge: null,
          },
          lastPlayedAt: new Date().toISOString(),
        }
      },
      { persist: 'immediate' },
    )
  }

  async function buyRoomAccess(categoryId, cost) {
    const currentState = playerStateRef.current

    if (currentState.unlockedCategoryIds.includes(categoryId)) {
      const hasPendingPurchase = currentState._creditMovements?.some(
        (movement) => movement.kind === 'room_access' && movement.category_id === categoryId,
      )
      return !hasPendingPurchase || (await flushPlayerState()).ok
    }

    if (persistence.blocked || currentState.credits < cost) {
      return false
    }

    const nextState = withCreditMovement({
      ...currentState,
      credits: currentState.credits - cost,
      unlockedCategoryIds: [...currentState.unlockedCategoryIds, categoryId],
      transitionState:
        currentState.transitionState?.pendingBridge?.targetCategoryId === categoryId
          ? { pendingBridge: null }
          : currentState.transitionState,
      lastPlayedAt: new Date().toISOString(),
    }, -cost, { kind: 'room_access', label: 'Sblocco stanza', categoryId, challengeId: null })

    commitPlayerState(nextState, { persist: 'none' })
    if (!accessCodeRef.current) return true
    clearScheduledSave()
    return (await persistPlayerState(nextState)).ok
  }

  function buyCategoryBundle(categoryIds = [], cost = 0) {
    if (!categoryIds.length) {
      return false
    }

    const currentState = playerStateRef.current

    if (currentState.credits < cost) {
      return false
    }

    updatePlayerState(withCreditMovement({
      ...currentState,
      credits: currentState.credits - cost,
      unlockedCategoryIds: Array.from(
        new Set([...currentState.unlockedCategoryIds, ...categoryIds]),
      ),
      lastPlayedAt: new Date().toISOString(),
    }, -cost, { kind: 'bundle_access', label: `Sblocco stanze: ${categoryIds.join(', ')}`, categoryId: categoryIds[0], challengeId: null }))

    return true
  }

  const syncActiveSessionSnapshot = useCallback(function syncActiveSessionSnapshot(snapshot, { debounced = true } = {}) {
    const persistMode = debounced ? 'debounced' : 'immediate'

    updatePlayerState(
      (currentState) => {
        const categoryId = snapshot?.categoryId ?? currentState.currentRoom

        if (!categoryId) {
          return currentState
        }

        const previousProgress =
          currentState.roomProgress[categoryId] ?? createDefaultRoomProgress(categoryId)
        const startedAt = previousProgress.startedAt ?? Date.now()
        const nextCurrentChallengeId = snapshot?.currentChallengeId ?? currentState.currentChallengeId
        const nextActiveSession = {
          ...snapshot,
          updatedAt: Date.now(),
        }
        const currentComparableSession = currentState.activeSession
          ? {
              ...currentState.activeSession,
              updatedAt: undefined,
            }
          : null
        const nextComparableSession = {
          ...nextActiveSession,
          updatedAt: undefined,
        }

        if (
          currentState.currentRoom === categoryId &&
          currentState.currentChallengeId === nextCurrentChallengeId &&
          previousProgress.startedAt === startedAt &&
          areSerializableSnapshotsEqual(currentComparableSession, nextComparableSession)
        ) {
          return currentState
        }

        return {
          ...currentState,
          roomProgress: {
            ...currentState.roomProgress,
            [categoryId]: {
              ...previousProgress,
              startedAt,
            },
          },
          currentRoom: categoryId,
          currentChallengeId: nextCurrentChallengeId,
          activeSession: nextActiveSession,
          lastPlayedAt: new Date().toISOString(),
        }
      },
      { persist: persistMode },
    )
  }, [updatePlayerState])

  const clearActiveSession = useCallback(function clearActiveSession() {
    updatePlayerState((currentState) => {
      if (!currentState.currentRoom && !currentState.currentChallengeId && !currentState.activeSession) {
        return currentState
      }

      return {
        ...currentState,
        currentRoom: null,
        currentChallengeId: '',
        activeSession: null,
      }
    })
  }, [updatePlayerState])

  function markVictoryModalSeen(categoryId) {
    updatePlayerState(
      (currentState) => {
        const previousProgress =
          currentState.roomProgress[categoryId] ?? createDefaultRoomProgress(categoryId)

        return {
          ...currentState,
          roomProgress: {
            ...currentState.roomProgress,
            [categoryId]: {
              ...previousProgress,
              victoryModalSeen: true,
            },
          },
        }
      },
      { persist: 'immediate' },
    )
  }

  const value = {
    accessCode,
    accessCodeId,
    authError,
    clearAuthFeedback,
    clearSyncFeedback,
    clearActiveSession,
    flushPlayerState,
    refreshPlayerState,
    isAuthenticated: Boolean(accessCode && role),
    hasVipAccess: Boolean(accessCode && role),
    isHydrating,
    isLoggingIn,
    isMusicEnabled,
    isSyncing,
    loadRoomArchive,
    login,
    logout,
    playerState,
    role,
    syncError,
    hasSyncConflict: persistence.blocked,
    unlockCategories,
    registerRoomOutcome,
    addCredits,
    applyChallengeFeedbackOutcome,
    spendCredits,
    registerQuizAttempt,
    registerWrongAnswer,
    markRoomIntroSeen,
    setMusicEnabled,
    toggleMusicEnabled,
    queuePendingBridge,
    markPendingBridgeSeen,
    clearPendingBridge,
    markRoomStarted,
    buyRoomAccess,
    buyCategoryBundle,
    syncActiveSessionSnapshot,
    markVictoryModalSeen,
    isCategoryUnlocked(categoryId) {
      return playerState.unlockedCategoryIds.includes(categoryId)
    },
    getRoomProgress(categoryId) {
      return playerState.roomProgress[categoryId] ?? null
    },
    getCredits() {
      return playerState.credits
    },
    canAttemptQuiz() {
      return (
        !persistence.blocked &&
        playerStateRef.current.stats.attemptsRemaining > 0 &&
        playerStateRef.current.stats.livesRemaining > 0
      )
    },
    getResumePath() {
      return getResumePathForState(playerState)
    },
    shouldShowHomeIntro() {
      return shouldShowHomeIntroForState(playerState)
    },
    isRoomIntroPending(categoryId) {
      const room = playerState.roomProgress[categoryId]
      return !(room?.introSeen ?? Boolean(room?.startedAt))
    },
  }

  return createElement(PlayerStateContext.Provider, { value }, children)
}

export function usePlayerState() {
  const context = useContext(PlayerStateContext)

  if (!context) {
    throw new Error('usePlayerState deve essere usato dentro PlayerStateProvider.')
  }

  return context
}
