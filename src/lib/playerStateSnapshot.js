export const MAX_DAILY_QUIZ_ATTEMPTS = 3
export const MAX_DAILY_LIVES = 2
export const DEFAULT_UNLOCKED_CATEGORY_IDS = ['musica']

function clampNonNegativeInteger(value) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.trunc(value))
}

function clampRemaining(value, maxValue) {
  return Math.min(maxValue, clampNonNegativeInteger(value))
}

export function createDefaultStats() {
  return {
    date: '',
    quizzesStarted: 0,
    quizzesAttempted: 0,
    wrongAnswers: 0,
    wrongAnswersToday: 0,
    lastResetAt: Date.now(),
  }
}

export function createDefaultRoomProgress(categoryId) {
  return {
    categoryId,
    startedAt: null,
    sessions: [],
    unlockedByScore: false,
    prizeWon: false,
    buyAccessAvailable: false,
  }
}

export function createDefaultPlayerState() {
  return {
    version: 1,
    createdAt: Date.now(),
    credits: 0,
    stats: createDefaultStats(),
    roomProgress: {},
    unlockedCategoryIds: [...DEFAULT_UNLOCKED_CATEGORY_IDS],
    currentRoom: null,
    currentChallengeId: '',
    activeSession: null,
    lastPlayedAt: null,
  }
}

export function normalizeRoomProgress(roomProgress = {}) {
  if (!roomProgress || typeof roomProgress !== 'object' || Array.isArray(roomProgress)) {
    return {}
  }

  return Object.entries(roomProgress).reduce((accumulator, [categoryId, rawProgress]) => {
    const baseProgress = createDefaultRoomProgress(categoryId)

    accumulator[categoryId] = {
      ...baseProgress,
      ...rawProgress,
      sessions: Array.isArray(rawProgress?.sessions) ? rawProgress.sessions : [],
      startedAt: rawProgress?.startedAt ?? null,
    }

    return accumulator
  }, {})
}

export function normalizeSnapshot(snapshot) {
  const progress = snapshot?.progress ?? {}
  const dailyLimits = snapshot?.daily_limits ?? {}

  return {
    accessCodeId: snapshot?.access_code_id ?? '',
    role: snapshot?.role ?? '',
    playerState: {
      version: 1,
      createdAt: progress?.created_at ? Date.parse(progress.created_at) || Date.now() : Date.now(),
      credits: progress?.credits ?? 0,
      stats: {
        date: dailyLimits?.play_date ?? '',
        quizzesStarted: 0,
        quizzesAttempted: dailyLimits?.quizzes_attempted ?? 0,
        wrongAnswers: 0,
        wrongAnswersToday: dailyLimits?.wrong_answers_today ?? 0,
        lastResetAt: dailyLimits?.updated_at
          ? Date.parse(dailyLimits.updated_at) || Date.now()
          : Date.now(),
      },
      roomProgress: normalizeRoomProgress(progress?.room_progress ?? {}),
      unlockedCategoryIds:
        Array.isArray(progress?.unlocked_category_ids) && progress.unlocked_category_ids.length
          ? progress.unlocked_category_ids
          : [...DEFAULT_UNLOCKED_CATEGORY_IDS],
      currentRoom: progress?.current_room ?? progress?.active_session?.categoryId ?? null,
      currentChallengeId:
        progress?.current_challenge_id ?? progress?.active_session?.currentChallengeId ?? '',
      activeSession: progress?.active_session ?? null,
      lastPlayedAt: progress?.last_played_at ?? null,
    },
  }
}

export function buildProgressPayload(playerState) {
  return {
    credits: playerState.credits,
    unlocked_category_ids: playerState.unlockedCategoryIds,
    current_room: playerState.currentRoom,
    current_challenge_id: playerState.currentChallengeId || null,
    room_progress: playerState.roomProgress,
    active_session: playerState.activeSession ?? null,
  }
}

export function buildDailyPayload(playerState) {
  return {
    quizzes_attempted: playerState.stats.quizzesAttempted,
    wrong_answers_today: playerState.stats.wrongAnswersToday,
  }
}

export function getAttemptsRemaining(playerState) {
  const attemptsUsed = clampNonNegativeInteger(playerState?.stats?.quizzesAttempted ?? 0)
  return Math.max(0, MAX_DAILY_QUIZ_ATTEMPTS - attemptsUsed)
}

export function getLivesRemaining(playerState) {
  const livesUsed = clampNonNegativeInteger(playerState?.stats?.wrongAnswersToday ?? 0)
  return Math.max(0, MAX_DAILY_LIVES - livesUsed)
}

export function remainingAttemptsToUsed(remainingAttempts) {
  return MAX_DAILY_QUIZ_ATTEMPTS - clampRemaining(remainingAttempts, MAX_DAILY_QUIZ_ATTEMPTS)
}

export function remainingLivesToUsed(remainingLives) {
  return MAX_DAILY_LIVES - clampRemaining(remainingLives, MAX_DAILY_LIVES)
}

export function resetMusicRoomIntroInPlayerState(playerState) {
  const roomProgress = playerState.roomProgress?.musica

  if (!roomProgress) {
    return playerState
  }

  return {
    ...playerState,
    roomProgress: {
      ...playerState.roomProgress,
      musica: {
        ...roomProgress,
        startedAt: null,
      },
    },
  }
}

export function resetCurrentPositionInPlayerState(playerState) {
  if (!playerState.currentRoom && !playerState.currentChallengeId && !playerState.activeSession) {
    return playerState
  }

  return {
    ...playerState,
    currentRoom: null,
    currentChallengeId: '',
    activeSession: null,
    lastPlayedAt: new Date().toISOString(),
  }
}

export function applyAdminStateOverrides(
  playerState,
  { credits, attemptsRemaining, livesRemaining, quizzesAttempted, wrongAnswersToday },
) {
  const nextCredits =
    typeof credits === 'number' ? clampNonNegativeInteger(credits) : playerState.credits
  const nextQuizzesAttempted =
    typeof attemptsRemaining === 'number'
      ? remainingAttemptsToUsed(attemptsRemaining)
      : typeof quizzesAttempted === 'number'
        ? clampNonNegativeInteger(quizzesAttempted)
        : playerState.stats.quizzesAttempted
  const nextWrongAnswersToday =
    typeof livesRemaining === 'number'
      ? remainingLivesToUsed(livesRemaining)
      : typeof wrongAnswersToday === 'number'
        ? clampNonNegativeInteger(wrongAnswersToday)
        : playerState.stats.wrongAnswersToday

  return {
    ...playerState,
    credits: nextCredits,
    stats: {
      ...playerState.stats,
      quizzesAttempted: nextQuizzesAttempted,
      wrongAnswersToday: nextWrongAnswersToday,
    },
    lastPlayedAt: new Date().toISOString(),
  }
}