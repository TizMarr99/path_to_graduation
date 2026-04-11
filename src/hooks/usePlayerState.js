import { useEffect, useMemo, useState } from 'react'

const PLAYER_STATE_STORAGE_KEY = 'path-to-graduation:player-state'

function getTodayDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function createDefaultPlayerState() {
  return {
    version: 1,
    createdAt: Date.now(),
    credits: 0,
    hasSeenMusicRoomIntro: false,
    stats: {
      date: getTodayDateKey(),
      quizzesStarted: 0,
      quizzesAttempted: 0,
      wrongAnswers: 0,
      wrongAnswersToday: 0,
      lastResetAt: Date.now(),
    },
    roomProgress: {},
    unlockedCategoryIds: ['musica'],
  }
}

function buildResetStats() {
  return {
    date: getTodayDateKey(),
    quizzesStarted: 0,
    quizzesAttempted: 0,
    wrongAnswers: 0,
    wrongAnswersToday: 0,
    lastResetAt: Date.now(),
  }
}

function loadPlayerState() {
  if (typeof window === 'undefined') {
    return createDefaultPlayerState()
  }

  try {
    const rawState = window.localStorage.getItem(PLAYER_STATE_STORAGE_KEY)

    if (!rawState) {
      return createDefaultPlayerState()
    }

    const parsedState = JSON.parse(rawState)
    const today = getTodayDateKey()

    if (parsedState?.stats?.date === today) {
      return {
        ...parsedState,
        credits: parsedState.credits ?? 0,
        hasSeenMusicRoomIntro: parsedState.hasSeenMusicRoomIntro ?? false,
        stats: {
          ...parsedState.stats,
          quizzesAttempted: parsedState.stats.quizzesAttempted ?? 0,
          wrongAnswersToday: parsedState.stats.wrongAnswersToday ?? 0,
        },
      }
    }

    return {
      ...parsedState,
      credits: parsedState.credits ?? 0,
      hasSeenMusicRoomIntro: parsedState.hasSeenMusicRoomIntro ?? false,
      stats: buildResetStats(),
    }
  } catch {
    return createDefaultPlayerState()
  }
}

export function usePlayerState() {
  const [playerState, setPlayerState] = useState(loadPlayerState)

  useEffect(() => {
    window.localStorage.setItem(PLAYER_STATE_STORAGE_KEY, JSON.stringify(playerState))
  }, [playerState])

  function unlockCategories(categoryIds = []) {
    if (!categoryIds.length) {
      return
    }

    setPlayerState((currentState) => ({
      ...currentState,
      unlockedCategoryIds: Array.from(
        new Set([...currentState.unlockedCategoryIds, ...categoryIds]),
      ),
    }))
  }

  function registerRoomOutcome({
    categoryId,
    correctCount,
    wrongCount,
    totalChallenges,
    unlockedCategoryIds = [],
  }) {
    setPlayerState((currentState) => {
      const passed = correctCount >= 8
      const previousProgress = currentState.roomProgress[categoryId] ?? {
        categoryId,
        sessions: [],
        unlockedByScore: false,
        prizeWon: false,
        buyAccessAvailable: false,
      }

      return {
        ...currentState,
        roomProgress: {
          ...currentState.roomProgress,
          [categoryId]: {
            ...previousProgress,
            sessions: [
              ...previousProgress.sessions,
              {
                categoryId,
                startedAt: Date.now(),
                completedAt: Date.now(),
                correctCount,
                wrongCount,
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
          ? Array.from(
              new Set([...currentState.unlockedCategoryIds, ...unlockedCategoryIds]),
            )
          : currentState.unlockedCategoryIds,
      }
    })
  }

  const helpers = useMemo(
    () => ({
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
        return playerState.stats.quizzesAttempted < 3 && playerState.stats.wrongAnswersToday < 2
      },
    }),
    [playerState],
  )

  function addCredits(amount) {
    if (amount <= 0) return
    setPlayerState((current) => ({
      ...current,
      credits: current.credits + amount,
    }))
  }

  function spendCredits(amount) {
    if (amount <= 0) return true
    if (playerState.credits < amount) return false
    setPlayerState((current) => {
      if (current.credits < amount) return current
      return { ...current, credits: current.credits - amount }
    })
    return true
  }

  function registerQuizAttempt() {
    setPlayerState((current) => ({
      ...current,
      stats: {
        ...current.stats,
        quizzesAttempted: current.stats.quizzesAttempted + 1,
      },
    }))
  }

  function registerWrongAnswer() {
    setPlayerState((current) => ({
      ...current,
      stats: {
        ...current.stats,
        wrongAnswersToday: current.stats.wrongAnswersToday + 1,
      },
    }))
  }

  function resetDailyCounters() {
    setPlayerState((current) => ({
      ...current,
      stats: buildResetStats(),
    }))
  }

  function resetPlayerState() {
    setPlayerState(createDefaultPlayerState())
  }

  function resetMusicRoomIntro() {
    setPlayerState((current) => ({
      ...current,
      hasSeenMusicRoomIntro: false,
    }))
  }

  function markMusicRoomIntroSeen() {
    setPlayerState((current) => ({
      ...current,
      hasSeenMusicRoomIntro: true,
    }))
  }

  function buyRoomAccess(categoryId, cost) {
    if (playerState.credits < cost) return false
    setPlayerState((current) => {
      if (current.credits < cost) return current
      return {
        ...current,
        credits: current.credits - cost,
        unlockedCategoryIds: Array.from(
          new Set([...current.unlockedCategoryIds, categoryId]),
        ),
      }
    })
    return true
  }

  function buyCategoryBundle(categoryIds = [], cost = 0) {
    if (!categoryIds.length) return false
    if (playerState.credits < cost) return false

    setPlayerState((current) => {
      if (current.credits < cost) return current

      return {
        ...current,
        credits: current.credits - cost,
        unlockedCategoryIds: Array.from(new Set([...current.unlockedCategoryIds, ...categoryIds])),
      }
    })

    return true
  }

  return {
    playerState,
    unlockCategories,
    registerRoomOutcome,
    addCredits,
    spendCredits,
    registerQuizAttempt,
    registerWrongAnswer,
    resetDailyCounters,
    resetPlayerState,
    resetMusicRoomIntro,
    markMusicRoomIntroSeen,
    buyRoomAccess,
    buyCategoryBundle,
    ...helpers,
  }
}
