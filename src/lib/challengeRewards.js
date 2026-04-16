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