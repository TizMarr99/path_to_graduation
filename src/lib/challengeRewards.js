export function resolveChallengeCreditBaseReward(challenge) {
  return Math.max(0, challenge?.creditReward ?? 10)
}

export function resolveChallengeCreditReward(challenge, feedback) {
  const baseReward = resolveChallengeCreditBaseReward(challenge)

  if (baseReward <= 0) {
    return 0
  }

  if (
    typeof feedback?.scoreEarned === 'number' &&
    typeof feedback?.maxScore === 'number' &&
    feedback.maxScore > 0
  ) {
    const clampedScore = Math.max(0, Math.min(feedback.scoreEarned, feedback.maxScore))
    return Math.round((baseReward * clampedScore) / feedback.maxScore)
  }

  return feedback?.isCorrect ? baseReward : 0
}

function resolveNormalizedFeedbackScore(feedback) {
  if (
    typeof feedback?.scoreEarned === 'number' &&
    typeof feedback?.maxScore === 'number' &&
    feedback.maxScore > 0
  ) {
    const clampedScore = Math.max(0, Math.min(feedback.scoreEarned, feedback.maxScore))
    return clampedScore / feedback.maxScore
  }

  return feedback?.isCorrect ? 1 : 0
}

function createEmptyTypeResult() {
  return { passed: 0, total: 0, score: 0 }
}

function buildTypeResults(category, feedbackMap) {
  const typeResults = {}

  for (const challenge of category.challenges ?? []) {
    const quizType = challenge.quizSubType ?? challenge.type
    if (!typeResults[quizType]) {
      typeResults[quizType] = createEmptyTypeResult()
    }

    typeResults[quizType].total += 1

    const feedback = feedbackMap.get(challenge.id)
    if (feedback?.isCorrect) {
      typeResults[quizType].passed += 1
    }

    typeResults[quizType].score += resolveNormalizedFeedbackScore(feedback)
  }

  return typeResults
}

function selectChallengesForScoreGroup(groupConfig, challenges) {
  const selectedChallenges = []
  const selectedIds = new Set()
  const challengeIds = new Set(groupConfig.challengeIds ?? [])
  const quizTypes = new Set(groupConfig.quizTypes ?? [])

  for (const challenge of challenges) {
    const quizType = challenge.quizSubType ?? challenge.type
    const matchesById = challengeIds.has(challenge.id)
    const matchesByType = quizTypes.has(quizType)

    if ((matchesById || matchesByType) && !selectedIds.has(challenge.id)) {
      selectedChallenges.push(challenge)
      selectedIds.add(challenge.id)
    }
  }

  return selectedChallenges
}

function buildScoreGroupResult(challenges, feedbackMap, weight, defaultPassingThreshold, groupPassingThreshold) {
  const result = {
    passed: 0,
    total: challenges.length,
    score: 0,
    weight,
    normalizedScore: 0,
    passingThreshold:
      typeof groupPassingThreshold === 'number' && groupPassingThreshold > 0
        ? groupPassingThreshold
        : defaultPassingThreshold,
    isPassing: false,
  }

  for (const challenge of challenges) {
    const feedback = feedbackMap.get(challenge.id)
    if (feedback?.isCorrect) {
      result.passed += 1
    }
  }

  if (result.total > 0) {
    result.score = result.passed
    result.normalizedScore = result.passed / result.total
    result.isPassing = result.normalizedScore >= result.passingThreshold
  }

  return result
}

function buildConfiguredGroupResults(category, feedbackMap, config) {
  const groups = config.scoreGroups ?? []
  const groupResults = {}

  for (const groupConfig of groups) {
    const groupChallenges = selectChallengesForScoreGroup(groupConfig, category.challenges ?? [])
    groupResults[groupConfig.id] = buildScoreGroupResult(
      groupChallenges,
      feedbackMap,
      groupConfig.weight ?? 1,
      config.passingThreshold ?? 0.6,
      groupConfig.passingThreshold,
    )
  }

  return groupResults
}

function buildFallbackGroupResults(typeResults, config) {
  const typeWeights = config.typeWeights ?? {}
  const groupResults = {}

  for (const [quizType, result] of Object.entries(typeResults)) {
    const normalizedScore = result.total > 0 ? result.passed / result.total : 0
    const passingThreshold = config.passingThreshold ?? 0.6
    groupResults[quizType] = {
      ...result,
      score: result.passed,
      weight: typeWeights[quizType] ?? 1,
      normalizedScore,
      passingThreshold,
      isPassing: result.total > 0 && normalizedScore >= passingThreshold,
    }
  }

  return groupResults
}

function evaluateSubPrizeCondition(condition, context) {
  if (!condition) return false

  const {
    typeResults,
    groupResults,
    weightedScore,
  } = context

  switch (condition.type) {
    case 'zone_clear': {
      const types = condition.quizTypes ?? []
      return types.every((quizType) => {
        const result = typeResults[quizType]
        return result && result.passed === result.total && result.total > 0
      })
    }
    case 'type_threshold': {
      const result = typeResults[condition.quizType]
      if (!result || result.total === 0) return false
      return result.passed / result.total >= (condition.threshold ?? 1)
    }
    case 'min_weighted_score':
      return weightedScore >= (condition.threshold ?? 0.8)
    case 'perfect_type': {
      const result = typeResults[condition.quizType]
      return result && result.passed === result.total && result.total > 0
    }
    case 'group_clear': {
      const groupIds = condition.groupIds ?? []
      return groupIds.every((groupId) => groupResults[groupId]?.isPassing === true)
    }
    case 'groups_threshold': {
      const groupIds = condition.groupIds ?? []
      const passedGroups = groupIds.reduce((count, groupId) => {
        return count + (groupResults[groupId]?.isPassing ? 1 : 0)
      }, 0)
      return passedGroups >= (condition.threshold ?? groupIds.length)
    }
    default:
      return false
  }
}

function resolveSubPrizesWon(subPrizes, evaluationContext) {
  const matchedPrizes = (subPrizes ?? []).filter((prize) => {
    return evaluateSubPrizeCondition(prize.condition, evaluationContext)
  })

  if (matchedPrizes.length === 0) {
    return []
  }

  const resolvedPrizeIds = []
  const bestPrizeByFamily = new Map()

  for (const prize of matchedPrizes) {
    if (!prize.familyId) {
      resolvedPrizeIds.push(prize.id)
      continue
    }

    const currentBest = bestPrizeByFamily.get(prize.familyId)
    if (!currentBest || (prize.tierRank ?? 0) > (currentBest.tierRank ?? 0)) {
      bestPrizeByFamily.set(prize.familyId, prize)
    }
  }

  return [
    ...resolvedPrizeIds,
    ...Array.from(bestPrizeByFamily.values()).map((prize) => prize.id),
  ]
}

/**
 * Compute weighted room score for categories with weightedScoring config.
 *
 * @param {import('../types/challenge').Category} category
 * @param {Map<string, import('../types/challenge').ChallengeFeedback>} feedbackMap
 *   Map of challengeId → feedback from completed challenges
 * @returns {{
 *   typeResults: Record<string, { passed: number, total: number, score: number }>,
 *   groupResults: Record<string, { passed: number, total: number, score: number, weight: number, normalizedScore: number, passingThreshold: number, isPassing: boolean }>,
 *   weightedScore: number,
 *   isPassing: boolean,
 *   subPrizesWon: string[],
 * }}
 */
export function computeWeightedRoomScore(category, feedbackMap) {
  const config = category.weightedScoring
  if (!config) {
    const totalCorrect = [...feedbackMap.values()].filter((f) => f.isCorrect).length
    return {
      typeResults: {},
      groupResults: {},
      weightedScore: totalCorrect,
      isPassing: totalCorrect >= (category.challenges?.length ?? 0) * 0.6,
      subPrizesWon: [],
    }
  }

  const typeResults = buildTypeResults(category, feedbackMap)
  const groupResults = (config.scoreGroups?.length ?? 0) > 0
    ? buildConfiguredGroupResults(category, feedbackMap, config)
    : buildFallbackGroupResults(typeResults, config)

  let weightedScore = 0
  let totalWeight = 0

  for (const result of Object.values(groupResults)) {
    totalWeight += result.weight
    weightedScore += (result.isPassing ? 1 : 0) * result.weight
  }

  if (totalWeight > 0) {
    weightedScore = weightedScore / totalWeight
  }

  const isPassing = weightedScore >= (config.passingThreshold ?? 0.6)

  const subPrizesWon = resolveSubPrizesWon(category.subPrizes, {
    typeResults,
    groupResults,
    weightedScore,
  })

  return { typeResults, groupResults, weightedScore, isPassing, subPrizesWon }
}