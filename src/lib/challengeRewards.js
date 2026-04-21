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

/**
 * Compute weighted room score for categories with weightedScoring config.
 *
 * @param {import('../types/challenge').Category} category
 * @param {Map<string, import('../types/challenge').ChallengeFeedback>} feedbackMap
 *   Map of challengeId → feedback from completed challenges
 * @returns {{
 *   typeResults: Record<string, { passed: number, total: number, score: number }>,
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
      weightedScore: totalCorrect,
      isPassing: totalCorrect >= (category.challenges?.length ?? 0) * 0.6,
      subPrizesWon: [],
    }
  }

  const typeWeights = config.typeWeights ?? {}
  const typeResults = {}

  for (const challenge of category.challenges ?? []) {
    const quizType = challenge.quizSubType ?? challenge.type
    if (!typeResults[quizType]) {
      typeResults[quizType] = { passed: 0, total: 0, score: 0 }
    }
    typeResults[quizType].total += 1

    const feedback = feedbackMap.get(challenge.id)
    if (feedback?.isCorrect) {
      typeResults[quizType].passed += 1
    }

    if (feedback && typeof feedback.scoreEarned === 'number' && typeof feedback.maxScore === 'number' && feedback.maxScore > 0) {
      typeResults[quizType].score += feedback.scoreEarned / feedback.maxScore
    } else if (feedback?.isCorrect) {
      typeResults[quizType].score += 1
    }
  }

  let weightedScore = 0
  let totalWeight = 0

  for (const [quizType, result] of Object.entries(typeResults)) {
    const weight = typeWeights[quizType] ?? 1
    totalWeight += weight
    const typeScore = result.total > 0 ? result.score / result.total : 0
    weightedScore += typeScore * weight
  }

  if (totalWeight > 0) {
    weightedScore = weightedScore / totalWeight
  }

  const isPassing = weightedScore >= (config.passingThreshold ?? 0.6)

  const subPrizesWon = (category.subPrizes ?? [])
    .filter((prize) => evaluateSubPrizeCondition(prize.condition, typeResults, weightedScore))
    .map((prize) => prize.id)

  return { typeResults, weightedScore, isPassing, subPrizesWon }
}

function evaluateSubPrizeCondition(condition, typeResults, weightedScore) {
  if (!condition) return false

  switch (condition.type) {
    case 'zone_clear': {
      const types = condition.quizTypes ?? []
      return types.every((qt) => {
        const result = typeResults[qt]
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
    default:
      return false
  }
}