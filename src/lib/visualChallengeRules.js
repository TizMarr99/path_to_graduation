import { matchesAcceptedAnswer } from './answerNormalization.js'

export function evaluateVisualRound(challenge, round, answer, visibleCount = 1) {
  if (challenge.type === 'memory_palette') {
    return {
      isCorrect: Array.isArray(answer) && answer.length === round.correctColorIds.length &&
        new Set(answer).size === answer.length && answer.every((id) => round.correctColorIds.includes(id)),
      solution: round.colors.filter((c) => round.correctColorIds.includes(c.id)).map((c) => c.name).join(', '),
    }
  }
  const aliases = [...(round.acceptedAnswers ?? [])]
  for (const brand of round.recognizedBrands ?? []) {
    for (const alias of round.acceptedAnswers ?? []) aliases.push(`${brand} ${alias}`, `${alias} ${brand}`)
  }
  const open = challenge.type === 'progressive_clue_rounds' || round.mode === 'free_text'
  const isCorrect = open ? matchesAcceptedAnswer(answer ?? '', aliases) : answer === round.correctChoiceId
  return {
    isCorrect,
    solution: round.solutionLabel || (open ? aliases[0] : round.choices?.find((c) => c.id === round.correctChoiceId)?.text),
    descriptivePoints: isCorrect ? Math.max(1, 4 - visibleCount) : 0,
  }
}

export function matchesTimelineDecade(answer, year) {
  const short = String(year).slice(2)
  const word = { 1920: 'venti', 1950: 'cinquanta', 1960: 'sessanta', 1970: 'settanta', 1980: 'ottanta', 1990: 'novanta' }[year]
  return matchesAcceptedAnswer(answer, [String(year), short, `${short}s`, `${year}s`, `anni ${short}`, `anni ${year}`, word, `anni ${word}`])
}

// Equal periods belong to the same slots; a repeated item never earns extra points.
export function countVisualTimelinePlacements(order = [], correctOrder = [], items = [], allowEqualYears = false) {
  const years = new Map(items.map((item) => [item.id, item.year]))
  const seen = new Set()
  return correctOrder.reduce((count, expectedId, index) => {
    const actualId = order[index]
    if (!years.has(actualId) || seen.has(actualId)) return count
    seen.add(actualId)
    const matches = actualId === expectedId || (
      allowEqualYears && Number.isFinite(years.get(actualId)) &&
      years.get(actualId) === years.get(expectedId)
    )
    return count + Number(matches)
  }, 0)
}

export function reconcileVisualTimelineOrder(order = [], initialOrder = []) {
  const valid = new Set(initialOrder)
  return [...new Set([...order.filter((id) => valid.has(id)), ...initialOrder])]
}

// Persist absolute deadlines, never a fresh countdown on remount/refresh.
export function observationPhase(deadline, now) {
  if (!Number.isFinite(deadline)) return 'unseen'
  return now < deadline ? 'viewing' : 'answering'
}

export function canSubmitVisualChallenge(challenge, state = {}, now = Date.now(), draft = {}) {
  if (challenge.contentStatus && challenge.contentStatus !== 'ready') return false
  if (challenge.contentVersion === 2) {
    if (challenge.type === 'visual_timeline') {
      const slots = draft.visualTimelineSlots ?? {}
      const capacities = [1, 1, 1, 2, 1, 1]
      return state.visualTimelineRevealedCount === challenge.items.length &&
        challenge.items.every((item) => Number.isInteger(slots[item.id]) && slots[item.id] >= 0 && slots[item.id] < 6) &&
        capacities.every((capacity, slot) => challenge.items.filter((item) => slots[item.id] === slot).length === capacity)
    }
    if (challenge.rounds && !challenge.simultaneousRounds &&
      !challenge.rounds.every((round) => draft.lockedRounds?.[round.id])) return false
  }
  const timedRounds = challenge.type === 'memory_palette'
    ? challenge.rounds
    : challenge.type === 'multi_round_quiz' ? challenge.rounds.filter((round) => round.displaySeconds) : []
  return timedRounds.every((round) => observationPhase(state.observationDeadlines?.[round.id], now) === 'answering')
}
