export const MAX_DAILY_QUIZ_ATTEMPTS = 3
export const MAX_DAILY_LIVES = 2
export const DEFAULT_UNLOCKED_CATEGORY_IDS = ['musica']

function clampNonNegativeInteger(value) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.trunc(value))
}

export function createDefaultStats() {
  return {
    date: '',
    quizzesStarted: 0,
    attemptsRemaining: MAX_DAILY_QUIZ_ATTEMPTS,
    wrongAnswers: 0,
    livesRemaining: MAX_DAILY_LIVES,
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
        attemptsRemaining: clampNonNegativeInteger(dailyLimits?.attempts_remaining ?? MAX_DAILY_QUIZ_ATTEMPTS),
        wrongAnswers: 0,
        livesRemaining: clampNonNegativeInteger(dailyLimits?.lives_remaining ?? MAX_DAILY_LIVES),
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
    attempts_remaining: playerState.stats.attemptsRemaining,
    lives_remaining: playerState.stats.livesRemaining,
  }
}

export function getAttemptsRemaining(playerState) {
  const raw = playerState?.stats?.attemptsRemaining ?? 0
  return Math.max(0, Number.isFinite(raw) ? Math.trunc(raw) : 0)
}

export function getLivesRemaining(playerState) {
  const raw = playerState?.stats?.livesRemaining ?? 0
  return Math.max(0, Number.isFinite(raw) ? Math.trunc(raw) : 0)
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
  { credits, attemptsRemaining, livesRemaining },
) {
  const nextCredits =
    typeof credits === 'number' ? clampNonNegativeInteger(credits) : playerState.credits
  const nextAttemptsRemaining =
    typeof attemptsRemaining === 'number'
      ? clampNonNegativeInteger(attemptsRemaining)
      : playerState.stats.attemptsRemaining
  const nextLivesRemaining =
    typeof livesRemaining === 'number'
      ? clampNonNegativeInteger(livesRemaining)
      : playerState.stats.livesRemaining

  return {
    ...playerState,
    credits: nextCredits,
    stats: {
      ...playerState.stats,
      attemptsRemaining: nextAttemptsRemaining,
      livesRemaining: nextLivesRemaining,
    },
    lastPlayedAt: new Date().toISOString(),
  }
}