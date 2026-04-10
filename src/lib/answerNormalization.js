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
 * @param {string} inputValue
 * @param {string[]} acceptedAnswers
 * @returns {boolean}
 */
export function matchesAcceptedAnswer(inputValue, acceptedAnswers = []) {
  const normalizedInput = normalizeAnswer(inputValue)

  if (!normalizedInput) {
    return false
  }

  return acceptedAnswers.some(
    (answer) => normalizeAnswer(answer) === normalizedInput,
  )
}