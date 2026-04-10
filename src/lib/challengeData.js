import rawCategories from '../data/categories.json'

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
        src: asset,
      }
    }

    return {
      id: asset.id ?? `asset-${index}`,
      kind: asset.kind ?? asset.type ?? 'image',
      src: asset.src,
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

/**
 * @param {import('../types/challenge').RawChallengeBase} rawChallenge
 * @returns {import('../types/challenge').ChallengeBase}
 */
function createChallengeBase(rawChallenge) {
  return {
    id: rawChallenge.id,
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

/**
 * @param {import('../types/challenge').RawChallenge} rawChallenge
 * @returns {import('../types/challenge').Challenge}
 */
function normalizeChallenge(rawChallenge) {
  const baseChallenge = createChallengeBase(rawChallenge)
  const challengeType = resolveChallengeType(rawChallenge)

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