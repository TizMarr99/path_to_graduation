/**
 * @param {string} value
 * @returns {string}
 */
export function normalizeAnswer(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * @param {string} value
 * @returns {string}
 */
export function normalizeCompactAnswer(value) {
  return normalizeAnswer(value).replace(/[^a-z0-9]/g, '')
}

/**
 * @param {string} inputValue
 * @param {string[]} acceptedAnswers
 * @returns {boolean}
 */
export function matchesAcceptedAnswer(inputValue, acceptedAnswers = []) {
  const normalizedInput = normalizeCompactAnswer(inputValue)

  if (!normalizedInput) {
    return false
  }

  return acceptedAnswers.some(
    (answer) => normalizeCompactAnswer(answer) === normalizedInput,
  )
}

/**
 * @param {string} inputValue
 * @param {string[]} acceptedAnswers
 * @returns {boolean}
 */
export function matchesAcceptedAnswerLoose(inputValue, acceptedAnswers = []) {
  const normalizedInput = normalizeAnswer(inputValue)

  if (!normalizedInput) {
    return false
  }

  return acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalizedInput)
}

/**
 * Keeps contractions intact so lyrics like "don't" count as a single word.
 * @param {string} value
 * @returns {string[]}
 */
export function tokenizeLyricsWords(value) {
  return normalizeAnswer(value)
    .split(/[^a-z0-9']+/)
    .map((word) => word.replace(/^'+|'+$/g, '').trim())
    .filter(Boolean)
}

/**
 * @param {string} inputValue
 * @param {string} solutionText
 * @param {number} minimumWordMatchRatio
 * @returns {{ matchedWordCount: number, requiredWordCount: number, ratio: number, isMatch: boolean }}
 */
export function evaluateLyricsWordMatch(
  inputValue,
  solutionText,
  minimumWordMatchRatio = 0.7,
) {
  const inputWords = tokenizeLyricsWords(inputValue)
  const solutionWords = tokenizeLyricsWords(solutionText)
  const requiredWordCount = Math.floor(solutionWords.length * minimumWordMatchRatio)
  let matchedWordCount = 0

  solutionWords.forEach((solutionWord, index) => {
    if (inputWords[index] === solutionWord) {
      matchedWordCount += 1
    }
  })

  const ratio = solutionWords.length ? matchedWordCount / solutionWords.length : 0

  return {
    matchedWordCount,
    requiredWordCount,
    ratio,
    isMatch: matchedWordCount >= requiredWordCount,
  }
}

/**
 * @param {string} titleAnswer
 * @param {string[]} acceptedTitleAnswers
 * @param {string} authorAnswer
 * @param {string[]} acceptedAuthorAnswers
 * @returns {{ titleMatched: boolean, authorMatched: boolean, matchedCount: number }}
 */
export function evaluateTitleAuthorMatch(
  titleAnswer,
  acceptedTitleAnswers,
  authorAnswer,
  acceptedAuthorAnswers,
) {
  const titleMatched = matchesAcceptedAnswer(titleAnswer, acceptedTitleAnswers)
  const authorMatched = matchesAcceptedAnswer(authorAnswer, acceptedAuthorAnswers)

  return {
    titleMatched,
    authorMatched,
    matchedCount: Number(titleMatched) + Number(authorMatched),
  }
}

/**
 * @param {string[]} answers
 * @param {import('../types/challenge').AcceptedAnswerGroup[]} singerGroups
 * @returns {{ matchedGroupIds: string[], matchedCount: number }}
 */
export function evaluateFaceMorphAnswers(answers = [], singerGroups = []) {
  const normalizedAnswers = answers
    .map((answer) => normalizeCompactAnswer(answer))
    .filter(Boolean)
  const availableAnswers = [...normalizedAnswers]
  const matchedGroupIds = []

  singerGroups.forEach((group) => {
    const matchingIndex = availableAnswers.findIndex((candidate) =>
      group.acceptedAnswers.some(
        (acceptedAnswer) => normalizeCompactAnswer(acceptedAnswer) === candidate,
      ),
    )

    if (matchingIndex >= 0) {
      matchedGroupIds.push(group.id ?? String(matchedGroupIds.length))
      availableAnswers.splice(matchingIndex, 1)
    }
  })

  return {
    matchedGroupIds,
    matchedCount: matchedGroupIds.length,
  }
}

/**
 * @param {string[]} currentOrder
 * @param {string[]} correctOrder
 * @returns {number}
 */
export function countCorrectPlacements(currentOrder = [], correctOrder = []) {
  return currentOrder.reduce((count, itemId, index) => {
    return count + Number(itemId === correctOrder[index])
  }, 0)
}

/**
 * @param {Record<string, string>} selections
 * @param {{ id: string, correctOptionId: string }[]} items
 * @returns {{ matchedItemIds: string[], matchedCount: number }}
 */
export function evaluateImageOptionMatching(selections = {}, items = []) {
  const matchedItemIds = items
    .filter((item) => selections[item.id] === item.correctOptionId)
    .map((item) => item.id)

  return {
    matchedItemIds,
    matchedCount: matchedItemIds.length,
  }
}

/**
 * @param {string[][]} columnOrders
 * @param {{ id: string, correctOrder: string[], bonusNameAcceptedAnswers?: string[] }[]} rows
 * @param {Record<string, string>} bonusNames
 * @returns {{ matchedRowIds: string[], matchedCount: number, bonusNameMatches: number }}
 */
export function evaluateColumnReorderMatching(columnOrders = [], rows = [], bonusNames = {}) {
  const matchedRowIds = []
  let bonusNameMatches = 0

  rows.forEach((row) => {
    const isRowCorrect = row.correctOrder.every((cellId, colIndex) => {
      const columnOrder = columnOrders[colIndex] ?? []
      const rowIndexInColumn = row.correctOrder.indexOf(cellId)
      const expectedRowPosition = rows.findIndex((r) => r.id === row.id)
      return columnOrder[expectedRowPosition] === cellId
    })

    if (isRowCorrect) {
      matchedRowIds.push(row.id)
    }

    if (
      row.bonusNameAcceptedAnswers?.length &&
      bonusNames[row.id] &&
      matchesAcceptedAnswer(bonusNames[row.id], row.bonusNameAcceptedAnswers)
    ) {
      bonusNameMatches += 1
    }
  })

  return {
    matchedRowIds,
    matchedCount: matchedRowIds.length,
    bonusNameMatches,
  }
}

/**
 * @param {Record<string, { number: string, suit: string }>} selections
 * @param {{ id: string, correctNumber: string, correctSuit: string }[]} items
 * @returns {{ matchedItemIds: string[], matchedCount: number }}
 */
export function evaluateCardMatching(selections = {}, items = []) {
  const matchedItemIds = items
    .filter((item) => {
      const sel = selections[item.id]
      if (!sel) return false
      return (
        normalizeCompactAnswer(sel.number) === normalizeCompactAnswer(item.correctNumber) &&
        normalizeCompactAnswer(sel.suit) === normalizeCompactAnswer(item.correctSuit)
      )
    })
    .map((item) => item.id)

  return {
    matchedItemIds,
    matchedCount: matchedItemIds.length,
  }
}