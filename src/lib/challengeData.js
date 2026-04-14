import rawCategories from '../data/categories.json'

const STATIC_ASSET_PREFIXES = new Map([
  ['/src/data/musica/', '/musica/'],
])

function resolveStaticAssetPath(src = '') {
  for (const [sourcePrefix, publicPrefix] of STATIC_ASSET_PREFIXES.entries()) {
    if (src.startsWith(sourcePrefix)) {
      return src.replace(sourcePrefix, publicPrefix)
    }
  }

  return src
}

/**
 * @param {import('../types/challenge').RawChallenge} rawChallenge
 * @returns {import('../types/challenge').ChallengeType}
 */
function resolveChallengeType(rawChallenge) {
  const declaredType = rawChallenge.type ?? rawChallenge.mode ?? 'multiple_choice'

  if (declaredType === 'puzzle') {
    return 'sequence_reconstruction'
  }

  return declaredType
}

/**
 * @param {Array<string | import('../types/challenge').ChallengeAsset> | undefined} rawAssets
 * @returns {import('../types/challenge').ChallengeAsset[]}
 */
function normalizeAssets(rawAssets = []) {
  return rawAssets.map((asset, index) => {
    if (typeof asset === 'string') {
      return {
        id: `asset-${index}`,
        kind: 'image',
        src: resolveStaticAssetPath(asset),
      }
    }

    return {
      id: asset.id ?? `asset-${index}`,
      kind: asset.kind ?? asset.type ?? 'image',
      src: resolveStaticAssetPath(asset.src),
      alt: asset.alt ?? '',
      caption: asset.caption ?? '',
    }
  })
}

/**
 * @param {import('../types/challenge').RawChallengeBase} rawChallenge
 * @returns {import('../types/challenge').ChallengeSpeaker}
 */
function normalizeSpeaker(rawChallenge) {
  if (rawChallenge.speaker === 'critic' || rawChallenge.speaker === 'neutral') {
    return rawChallenge.speaker
  }

  return 'curator'
}

function normalizeHintCost(rawHintCost, creditReward) {
  const safeReward = Math.max(1, creditReward)
  const fallbackHintCost = Math.max(1, Math.floor(safeReward * 0.5))
  const maxHintCost = Math.max(1, Math.min(safeReward - 1, Math.floor(safeReward * 0.6)))

  if (typeof rawHintCost !== 'number' || Number.isNaN(rawHintCost)) {
    return fallbackHintCost
  }

  return Math.max(1, Math.min(rawHintCost, maxHintCost))
}

/**
 * @param {import('../types/challenge').RawChallengeBase} rawChallenge
 * @returns {import('../types/challenge').ChallengeBase}
 */
function createChallengeBase(rawChallenge) {
  const creditReward = rawChallenge.creditReward ?? 10

  return {
    id: rawChallenge.id,
    zoneId: rawChallenge.zoneId ?? '',
    difficulty: rawChallenge.difficulty,
    type: resolveChallengeType(rawChallenge),
    title: rawChallenge.title ?? '',
    prompt: rawChallenge.prompt,
    assets: normalizeAssets(rawChallenge.assets),
    hint: rawChallenge.hint ?? '',
    explanation: rawChallenge.explanation ?? '',
    introNarration: rawChallenge.introNarration ?? '',
    successMessage: rawChallenge.successMessage ?? '',
    failureMessage: rawChallenge.failureMessage ?? '',
    speaker: normalizeSpeaker(rawChallenge),
    creditReward,
    hintCost: normalizeHintCost(rawChallenge.hintCost, creditReward),
  }
}

/**
 * @param {string[]} ids
 * @param {string[]} fallbackIds
 * @returns {string[]}
 */
function normalizeOrder(ids = [], fallbackIds = []) {
  if (!ids.length) {
    return [...fallbackIds]
  }

  const knownIds = new Set(fallbackIds)

  return ids.filter((id) => knownIds.has(id))
}

function normalizeFear(rawFear) {
  if (!rawFear?.id) {
    return null
  }

  const rawSfx = rawFear.sfxSrc
  const sfxSrc = Array.isArray(rawSfx)
    ? rawSfx.map((s) => resolveStaticAssetPath(s))
    : resolveStaticAssetPath(rawSfx ?? '')

  return {
    id: rawFear.id,
    name: rawFear.name ?? '',
    icon: rawFear.icon ?? '',
    description: rawFear.description ?? '',
    sfxSrc,
  }
}

function normalizeRewardArtifact(rawRewardArtifact) {
  if (!rawRewardArtifact?.type) {
    return null
  }

  return {
    type: rawRewardArtifact.type,
    label: rawRewardArtifact.label ?? '',
    description: rawRewardArtifact.description ?? '',
  }
}

function normalizeMapHotspots(rawMapHotspots = []) {
  return rawMapHotspots.map((hotspot) => ({
    id: hotspot.id,
    label: hotspot.label ?? '',
    description: hotspot.description ?? '',
    icon: hotspot.icon ?? '',
    x: hotspot.x ?? 0,
    y: hotspot.y ?? 0,
    width: hotspot.width ?? 0,
    height: hotspot.height ?? 0,
  }))
}

/**
 * @param {import('../types/challenge').RawChallenge} rawChallenge
 * @returns {import('../types/challenge').Challenge}
 */
function normalizeChallenge(rawChallenge) {
  const baseChallenge = createChallengeBase(rawChallenge)
  const challengeType = resolveChallengeType(rawChallenge)

  if (challengeType === 'guess_title_author') {
    return {
      ...baseChallenge,
      type: 'guess_title_author',
      acceptedTitleAnswers: rawChallenge.acceptedTitleAnswers ?? [],
      acceptedAuthorAnswers: rawChallenge.acceptedAuthorAnswers ?? [],
      titlePlaceholder: rawChallenge.titlePlaceholder ?? '',
      authorPlaceholder: rawChallenge.authorPlaceholder ?? '',
      scoring: {
        passThreshold: rawChallenge.scoring?.passThreshold ?? 2,
        fullMatchRatio: rawChallenge.scoring?.fullMatchRatio ?? 1,
        partialMatchRatio: rawChallenge.scoring?.partialMatchRatio ?? 0.5,
      },
    }
  }

  if (challengeType === 'face_morph') {
    return {
      ...baseChallenge,
      type: 'face_morph',
      singerGroups: rawChallenge.singerGroups ?? [],
      answerSlots: rawChallenge.answerSlots ?? 3,
      minimumCorrectGroups: rawChallenge.minimumCorrectGroups ?? 2,
      placeholder: rawChallenge.placeholder ?? '',
    }
  }

  if (challengeType === 'fill_lyrics') {
    return {
      ...baseChallenge,
      type: 'fill_lyrics',
      solutionText: rawChallenge.solutionText ?? '',
      placeholder: rawChallenge.placeholder ?? '',
      scoring: {
        minimumWordMatchRatio: rawChallenge.scoring?.minimumWordMatchRatio ?? 0.7,
      },
    }
  }

  if (challengeType === 'multiple_choice') {
    return {
      ...baseChallenge,
      type: 'multiple_choice',
      choices: rawChallenge.choices ?? [],
      correctChoiceId: rawChallenge.correctChoiceId ?? '',
    }
  }

  if (challengeType === 'ordering') {
    const itemIds = (rawChallenge.items ?? []).map((item) => item.id)

    return {
      ...baseChallenge,
      type: 'ordering',
      items: rawChallenge.items ?? [],
      correctOrder: normalizeOrder(rawChallenge.correctOrder, itemIds),
      initialOrder: normalizeOrder(rawChallenge.initialOrder, itemIds),
    }
  }

  if (challengeType === 'multi_stage_progressive_reveal') {
    const stageCount = rawChallenge.stages?.length ?? 0

    return {
      ...baseChallenge,
      type: 'multi_stage_progressive_reveal',
      stages: (rawChallenge.stages ?? []).map((stage) => ({
        ...stage,
        assets: normalizeAssets(stage.assets),
      })),
      initialVisibleStages: Math.min(
        Math.max(rawChallenge.initialVisibleStages ?? 1, 1),
        Math.max(stageCount, 1),
      ),
      solution: rawChallenge.solution,
      scoring: {
        maxScore: rawChallenge.scoring?.maxScore ?? 5,
        revealPenalty: rawChallenge.scoring?.revealPenalty ?? 1,
        minScore: rawChallenge.scoring?.minScore ?? 1,
      },
    }
  }

  if (challengeType === 'intruder') {
    return {
      ...baseChallenge,
      type: 'intruder',
      items: rawChallenge.items ?? [],
      intruderId: rawChallenge.intruderId ?? '',
    }
  }

  if (challengeType === 'sequence_reconstruction') {
    const segments = rawChallenge.segments ?? rawChallenge.pieces ?? []
    const segmentIds = segments.map((segment) => segment.id)

    return {
      ...baseChallenge,
      type: 'sequence_reconstruction',
      segments,
      correctOrder: normalizeOrder(
        rawChallenge.correctOrder ?? rawChallenge.solutionOrder,
        segmentIds,
      ),
      initialOrder: normalizeOrder(rawChallenge.initialOrder, segmentIds),
    }
  }

  if (challengeType === 'musical_chain') {
    return {
      ...baseChallenge,
      type: 'musical_chain',
      stages: (rawChallenge.stages ?? []).map((stage) => ({
        id: stage.id,
        title: stage.title ?? '',
        assets: normalizeAssets(stage.assets),
      })),
      acceptedAnswers: rawChallenge.acceptedAnswers ?? [],
      scoring: {
        maxScore: rawChallenge.scoring?.maxScore ?? 3,
        revealPenalty: rawChallenge.scoring?.revealPenalty ?? 1,
        minScore: rawChallenge.scoring?.minScore ?? 0,
      },
    }
  }

  if (challengeType === 'hitster') {
    const tracks = rawChallenge.tracks ?? []
    const trackIds = tracks.map((track) => track.id)

    return {
      ...baseChallenge,
      type: 'hitster',
      tracks: tracks.map((track) => ({
        id: track.id,
        year: track.year,
        title: track.title,
        titleAcceptedAnswers: track.titleAcceptedAnswers ?? [track.title],
        artist: track.artist,
        artistAcceptedAnswers: track.artistAcceptedAnswers ?? [track.artist],
        assets: normalizeAssets(track.assets),
      })),
      initialOrder: normalizeOrder(rawChallenge.initialOrder, trackIds),
      correctOrder: normalizeOrder(rawChallenge.correctOrder, trackIds),
      scoring: {
        minimumCorrectPlacements: rawChallenge.scoring?.minimumCorrectPlacements ?? 3,
      },
    }
  }

  return {
    ...baseChallenge,
    type: 'free_text',
    acceptedAnswers: rawChallenge.acceptedAnswers ?? [],
    placeholder: rawChallenge.placeholder ?? '',
  }
}

/**
 * @param {import('../types/challenge').RawCategory} rawCategory
 * @returns {import('../types/challenge').Category}
 */
function normalizeCategory(rawCategory) {
  return {
    id: rawCategory.id,
    kind: rawCategory.kind ?? 'room',
    title: rawCategory.title,
    ghost: rawCategory.ghost,
    description: rawCategory.description,
    unlockCost: rawCategory.unlockCost ?? 0,
    buyAccessCost: rawCategory.buyAccessCost ?? 0,
    backgroundImage: resolveStaticAssetPath(rawCategory.backgroundImage ?? ''),
    mapImage: resolveStaticAssetPath(rawCategory.mapImage ?? ''),
    mapHotspots: normalizeMapHotspots(rawCategory.mapHotspots),
    fear: normalizeFear(rawCategory.fear),
    rewardArtifact: normalizeRewardArtifact(rawCategory.rewardArtifact),
    characters: rawCategory.characters ?? null,
    introNarrative: rawCategory.introNarrative ?? null,
    characterComments: rawCategory.characterComments ?? null,
    challenges: (rawCategory.challenges ?? rawCategory.questions ?? []).map(normalizeChallenge),
  }
}

const categories = rawCategories.map(normalizeCategory)

/**
 * @returns {import('../types/challenge').Category[]}
 */
export function getCategories() {
  return categories
}

/**
 * @param {string | undefined} categoryId
 * @returns {import('../types/challenge').Category | null}
 */
export function getCategoryById(categoryId) {
  if (!categoryId) {
    return null
  }

  return categories.find((category) => category.id === categoryId) ?? null
}