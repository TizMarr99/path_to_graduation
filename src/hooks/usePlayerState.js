import { createContext, createElement, useContext, useEffect, useRef, useState } from 'react'
import {
  adminResetDailyLimits,
  adminResetPlayer,
  appGetSnapshot,
  appLogin,
  appSaveSnapshot,
} from '../lib/supabaseGameApi'
import {
  applyAdminStateOverrides,
  buildDailyPayload,
  buildProgressPayload,
  createDefaultPlayerState,
  createDefaultRoomProgress,
  MAX_DAILY_LIVES,
  MAX_DAILY_QUIZ_ATTEMPTS,
  normalizeSnapshot,
  resetCurrentPositionInPlayerState,
  resetMusicRoomIntroInPlayerState,
} from '../lib/playerStateSnapshot'

const PlayerStateContext = createContext(null)
const ACCESS_CODE_STORAGE_KEY = 'path-to-graduation:access-code'
const VIP_ACCESS_STORAGE_KEY = 'path-to-graduation:vip-access'
const SAVE_DEBOUNCE_MS = 900

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

function getResumePathForState(playerState) {
  const activeSession = playerState.activeSession

  if (activeSession?.categoryId) {
    const params = new URLSearchParams()

    if (activeSession.currentChallengeId) {
      params.set('challenge', activeSession.currentChallengeId)
    }

    const queryString = params.toString()

    return `/play/${activeSession.categoryId}${queryString ? `?${queryString}` : ''}`
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
  const [authError, setAuthError] = useState('')
  const [syncError, setSyncError] = useState('')
  const playerStateRef = useRef(playerState)
  const accessCodeRef = useRef(accessCode)
  const debouncedSaveTimeoutRef = useRef(null)

  useEffect(() => {
    playerStateRef.current = playerState
  }, [playerState])

  useEffect(() => {
    accessCodeRef.current = accessCode
  }, [accessCode])

  useEffect(() => {
    return () => {
      if (debouncedSaveTimeoutRef.current) {
        window.clearTimeout(debouncedSaveTimeoutRef.current)
      }
    }
  }, [])

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
  }, [])

  function applySnapshot(snapshot, nextCode = accessCodeRef.current) {
    const normalized = normalizeSnapshot(snapshot)

    playerStateRef.current = normalized.playerState
    accessCodeRef.current = nextCode

    setPlayerState(normalized.playerState)
    setRole(normalized.role)
    setAccessCodeId(normalized.accessCodeId)
    setAccessCode(nextCode)

    return normalized
  }

  function resetLocalSession() {
    clearPersistedAccessArtifacts()
    clearScheduledSave()

    const defaultPlayerState = createDefaultPlayerState()

    playerStateRef.current = defaultPlayerState
    accessCodeRef.current = ''

    setPlayerState(defaultPlayerState)
    setRole('')
    setAccessCodeId('')
    setAccessCode('')
    setAuthError('')
    setSyncError('')
  }

  function clearScheduledSave() {
    if (debouncedSaveTimeoutRef.current) {
      window.clearTimeout(debouncedSaveTimeoutRef.current)
      debouncedSaveTimeoutRef.current = null
    }
  }

  async function persistPlayerState(nextPlayerState, { silent = false } = {}) {
    if (!accessCodeRef.current) {
      return { ok: false }
    }

    if (!silent) {
      setIsSyncing(true)
    }

    setSyncError('')

    try {
      await appSaveSnapshot(
        accessCodeRef.current,
        buildProgressPayload(nextPlayerState),
        buildDailyPayload(nextPlayerState),
      )

      return { ok: true }
    } catch (error) {
      setSyncError(getFallbackErrorMessage(error, 'Impossibile salvare il progresso.'))
      return { ok: false, error }
    } finally {
      if (!silent) {
        setIsSyncing(false)
      }
    }
  }

  function commitPlayerState(nextPlayerState, { persist = 'immediate' } = {}) {
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
  }

  function updatePlayerState(updater, options) {
    const currentState = playerStateRef.current
    const nextPlayerState = typeof updater === 'function' ? updater(currentState) : updater

    if (nextPlayerState === currentState) {
      return currentState
    }

    return commitPlayerState(nextPlayerState, options)
  }

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

  function registerRoomOutcome({
    categoryId,
    correctCount,
    wrongCount,
    totalChallenges,
    unlockedCategoryIds = [],
  }) {
    updatePlayerState((currentState) => {
      const passed = correctCount >= 8
      const previousProgress =
        currentState.roomProgress[categoryId] ?? createDefaultRoomProgress(categoryId)
      const startedAt = previousProgress.startedAt ?? Date.now()

      return {
        ...currentState,
        roomProgress: {
          ...currentState.roomProgress,
          [categoryId]: {
            ...previousProgress,
            startedAt,
            sessions: [
              ...previousProgress.sessions,
              {
                categoryId,
                startedAt,
                completedAt: Date.now(),
                correctCount,
                wrongCount,
                totalChallenges,
                passed,
                unlockedCategoryIds: passed ? unlockedCategoryIds : [],
                prizeAwarded: passed,
              },
            ],
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
    })
  }

  function addCredits(amount) {
    if (amount <= 0) {
      return
    }

    updatePlayerState(
      (currentState) => ({
        ...currentState,
        credits: currentState.credits + amount,
        lastPlayedAt: new Date().toISOString(),
      }),
      { persist: 'debounced' },
    )
  }

  function applyChallengeFeedbackOutcome({ awardedCredits = 0, consumeLife = false }) {
    if (awardedCredits <= 0 && !consumeLife) {
      return
    }

    updatePlayerState(
      (currentState) => ({
        ...currentState,
        credits: currentState.credits + Math.max(0, awardedCredits),
        stats: {
          ...currentState.stats,
          livesRemaining: consumeLife
            ? Math.max(0, currentState.stats.livesRemaining - 1)
            : currentState.stats.livesRemaining,
        },
        lastPlayedAt: new Date().toISOString(),
      }),
      { persist: 'debounced' },
    )
  }

  function spendCredits(amount) {
    if (amount <= 0) {
      return true
    }

    const currentState = playerStateRef.current

    if (currentState.credits < amount) {
      return false
    }

    updatePlayerState(
      {
        ...currentState,
        credits: currentState.credits - amount,
        lastPlayedAt: new Date().toISOString(),
      },
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

  function resetDailyCounters() {
    updatePlayerState((currentState) => ({
      ...currentState,
      stats: {
        ...currentState.stats,
        attemptsRemaining: MAX_DAILY_QUIZ_ATTEMPTS,
        livesRemaining: MAX_DAILY_LIVES,
        lastResetAt: Date.now(),
      },
    }))
  }

  async function resetPlayerState() {
    const nextPlayerState = {
      ...createDefaultPlayerState(),
      createdAt: playerStateRef.current.createdAt,
    }

    clearScheduledSave()

    const result = await persistPlayerState(nextPlayerState)

    if (!result.ok) {
      return result
    }

    resetLocalSession()
    return { ok: true }
  }

  function resetMusicRoomIntro() {
    updatePlayerState((currentState) => resetMusicRoomIntroInPlayerState(currentState))
  }

  function markRoomStarted(categoryId, challengeId = '') {
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

  function markMusicRoomIntroSeen() {
    markRoomStarted('musica')
  }

  function buyRoomAccess(categoryId, cost) {
    const currentState = playerStateRef.current

    if (currentState.credits < cost) {
      return false
    }

    updatePlayerState({
      ...currentState,
      credits: currentState.credits - cost,
      unlockedCategoryIds: Array.from(new Set([...currentState.unlockedCategoryIds, categoryId])),
      lastPlayedAt: new Date().toISOString(),
    })

    return true
  }

  function buyCategoryBundle(categoryIds = [], cost = 0) {
    if (!categoryIds.length) {
      return false
    }

    const currentState = playerStateRef.current

    if (currentState.credits < cost) {
      return false
    }

    updatePlayerState({
      ...currentState,
      credits: currentState.credits - cost,
      unlockedCategoryIds: Array.from(
        new Set([...currentState.unlockedCategoryIds, ...categoryIds]),
      ),
      lastPlayedAt: new Date().toISOString(),
    })

    return true
  }

  function syncActiveSessionSnapshot(snapshot, { debounced = true } = {}) {
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
  }

  function clearActiveSession() {
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
  }

  function resetCurrentPosition() {
    updatePlayerState((currentState) => resetCurrentPositionInPlayerState(currentState))
  }

  async function resetDailyCountersForCode(targetCode = accessCodeRef.current) {
    if (!targetCode) {
      return { ok: false }
    }

    if (targetCode === accessCodeRef.current || role !== 'admin') {
      resetDailyCounters()
      return { ok: true }
    }

    try {
      await adminResetDailyLimits(accessCodeRef.current, targetCode)
      return { ok: true }
    } catch (error) {
      setSyncError(getFallbackErrorMessage(error, 'Impossibile azzerare i contatori giornalieri.'))
      return { ok: false, error }
    }
  }

  async function resetPlayerStateForCode(targetCode = accessCodeRef.current) {
    if (!targetCode) {
      return { ok: false }
    }

    if (targetCode === accessCodeRef.current || role !== 'admin') {
      return resetPlayerState()
    }

    try {
      await adminResetPlayer(accessCodeRef.current, targetCode)
      return { ok: true }
    } catch (error) {
      setSyncError(getFallbackErrorMessage(error, 'Impossibile resettare il profilo.'))
      return { ok: false, error }
    }
  }

  function setAdminStats({ credits, attemptsRemaining, livesRemaining }) {
    updatePlayerState(
      (currentState) => applyAdminStateOverrides(currentState, {
        credits,
        attemptsRemaining,
        livesRemaining,
      }),
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
    resetCurrentPosition,
    isAuthenticated: Boolean(accessCode && role),
    hasVipAccess: Boolean(accessCode && role),
    isHydrating,
    isLoggingIn,
    isSyncing,
    login,
    logout,
    playerState,
    role,
    syncError,
    unlockCategories,
    registerRoomOutcome,
    addCredits,
    applyChallengeFeedbackOutcome,
    spendCredits,
    registerQuizAttempt,
    registerWrongAnswer,
    resetDailyCounters,
    resetDailyCountersForCode,
    resetPlayerState,
    resetPlayerStateForCode,
    resetMusicRoomIntro,
    markMusicRoomIntroSeen,
    markRoomStarted,
    buyRoomAccess,
    buyCategoryBundle,
    syncActiveSessionSnapshot,
    setAdminStats,
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
        playerState.stats.attemptsRemaining > 0 &&
        playerState.stats.livesRemaining > 0
      )
    },
    getResumePath() {
      return getResumePathForState(playerState)
    },
    shouldShowHomeIntro() {
      return shouldShowHomeIntroForState(playerState)
    },
    isRoomIntroPending(categoryId) {
      return !playerState.roomProgress[categoryId]?.startedAt
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
