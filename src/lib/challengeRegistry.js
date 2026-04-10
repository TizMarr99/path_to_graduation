import { createElement } from 'react'
import ChallengeTemplateFallback from '../components/challenges/common/ChallengeTemplateFallback.jsx'
import FreeTextChallenge from '../components/challenges/templates/FreeTextChallenge.jsx'
import IntruderChallenge from '../components/challenges/templates/IntruderChallenge.jsx'
import MultiStageProgressiveRevealChallenge from '../components/challenges/templates/MultiStageProgressiveRevealChallenge.jsx'
import MultipleChoiceChallenge from '../components/challenges/templates/MultipleChoiceChallenge.jsx'
import OrderingChallenge from '../components/challenges/templates/OrderingChallenge.jsx'
import SequenceReconstructionChallenge from '../components/challenges/templates/SequenceReconstructionChallenge.jsx'
import { matchesAcceptedAnswer } from './answerNormalization'

export const challengeTypeLabels = {
  multiple_choice: 'Scelta multipla',
  free_text: 'Risposta libera',
  ordering: 'Riordino',
  multi_stage_progressive_reveal: 'Rivelazione progressiva',
  intruder: 'Intruso',
  sequence_reconstruction: 'Ricostruzione sequenza',
}

function renderMultipleChoiceChallenge(props) {
  return createElement(MultipleChoiceChallenge, props)
}

function renderFreeTextChallenge(props) {
  return createElement(FreeTextChallenge, props)
}

function renderOrderingChallenge(props) {
  return createElement(OrderingChallenge, props)
}

function renderProgressiveRevealChallenge(props) {
  return createElement(MultiStageProgressiveRevealChallenge, props)
}

function renderIntruderChallenge(props) {
  return createElement(IntruderChallenge, props)
}

function renderSequenceReconstructionChallenge(props) {
  return createElement(SequenceReconstructionChallenge, props)
}

/**
 * @param {string} selectedId
 * @param {string} correctId
 * @returns {boolean}
 */
function matchesSingleChoiceSelection(selectedId, correctId) {
  return Boolean(selectedId) && selectedId === correctId
}

/**
 * @param {string[]} currentOrder
 * @param {string[]} expectedOrder
 * @returns {boolean}
 */
function matchesExactOrder(currentOrder, expectedOrder) {
  return (
    currentOrder.length === expectedOrder.length &&
    currentOrder.every((itemId, index) => itemId === expectedOrder[index])
  )
}

/**
 * @param {import('../types/challenge').ProgressiveRevealChallenge['solution']} solution
 * @param {import('../types/challenge').ChallengeDraftAnswer} draftAnswer
 * @returns {boolean}
 */
function evaluateProgressiveRevealSolution(solution, draftAnswer) {
  if (solution.mode === 'multiple_choice') {
    return draftAnswer.selectedChoiceId === solution.correctChoiceId
  }

  return matchesAcceptedAnswer(draftAnswer.textAnswer, solution.acceptedAnswers)
}

/**
 * @param {import('../types/challenge').Challenge} challenge
 * @param {boolean} isCorrect
 * @returns {import('../types/challenge').ChallengeSpeaker}
 */
function resolveFeedbackSpeaker(challenge, isCorrect) {
  if (challenge.speaker && challenge.speaker !== 'neutral') {
    return challenge.speaker
  }

  return isCorrect ? 'curator' : 'critic'
}

/**
 * @param {import('../types/challenge').Challenge} challenge
 * @param {boolean} isCorrect
 * @returns {string}
 */
function resolveFeedbackMessage(challenge, isCorrect) {
  if (isCorrect) {
    return (
      challenge.successMessage ||
      challenge.explanation ||
      'Il Curatore lascia filtrare un bagliore: la prova ha ceduto.'
    )
  }

  return (
    challenge.failureMessage ||
    challenge.explanation ||
    'Il Critico confonde le tracce. Serve un nuovo tentativo.'
  )
}

/**
 * @param {import('../types/challenge').Challenge} challenge
 * @param {boolean} isCorrect
 * @param {import('../types/challenge').Category | null} category
 * @returns {import('../types/challenge').ChallengeFeedback}
 */
function buildChallengeFeedback(challenge, isCorrect, category) {
  return {
    isCorrect,
    title: isCorrect ? 'Il Curatore approva il passaggio' : 'Il Critico devia la rotta',
    message: resolveFeedbackMessage(challenge, isCorrect),
    attemptedChallengeId: challenge.id,
    categoryTitle: category?.title ?? '',
    speaker: resolveFeedbackSpeaker(challenge, isCorrect),
    tone: isCorrect ? 'success' : 'failure',
  }
}

/**
 * @param {import('../types/challenge').Challenge} challenge
 * @param {boolean} isCorrect
 * @param {import('../types/challenge').Category | null} category
 * @param {{
 *   message?: string,
 *   scoreEarned?: number,
 *   maxScore?: number,
 *   title?: string,
 * }} [overrides]
 * @returns {import('../types/challenge').ChallengeFeedback}
 */
function buildFeedback(challenge, isCorrect, category, overrides = {}) {
  return {
    ...buildChallengeFeedback(challenge, isCorrect, category),
    ...overrides,
  }
}

/**
 * @type {Record<import('../types/challenge').Challenge['type'], {
 *   render: (props: any) => React.ReactElement,
 *   evaluate: (args: {
 *     challenge: import('../types/challenge').Challenge,
 *     draftAnswer: import('../types/challenge').ChallengeDraftAnswer,
 *     challengeState: import('../types/challenge').ChallengeRuntimeState,
 *     category: import('../types/challenge').Category | null
 *   }) => import('../types/challenge').ChallengeFeedback
 * }>}
 */
export const challengeTypeRegistry = {
  multiple_choice: {
    render: renderMultipleChoiceChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const isCorrect = matchesSingleChoiceSelection(
        draftAnswer.selectedChoiceId,
        challenge.correctChoiceId,
      )

      return buildFeedback(challenge, isCorrect, category)
    },
  },
  free_text: {
    render: renderFreeTextChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const isCorrect = matchesAcceptedAnswer(
        draftAnswer.textAnswer,
        challenge.acceptedAnswers,
      )

      return buildFeedback(challenge, isCorrect, category)
    },
  },
  ordering: {
    render: renderOrderingChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const isCorrect = matchesExactOrder(
        draftAnswer.orderedItemIds,
        challenge.correctOrder,
      )

      return buildFeedback(challenge, isCorrect, category)
    },
  },
  multi_stage_progressive_reveal: {
    render: renderProgressiveRevealChallenge,
    evaluate: ({ challenge, draftAnswer, challengeState, category }) => {
      const isCorrect = evaluateProgressiveRevealSolution(
        challenge.solution,
        draftAnswer,
      )
      const revealsUsed = Math.max(
        0,
        challengeState.revealedStageCount - challenge.initialVisibleStages,
      )
      const scoreEarned = isCorrect
        ? Math.max(
            challenge.scoring.minScore,
            challenge.scoring.maxScore - revealsUsed * challenge.scoring.revealPenalty,
          )
        : 0
      const message = isCorrect
        ? `${resolveFeedbackMessage(challenge, true)} Punteggio ottenuto: ${scoreEarned}/${challenge.scoring.maxScore}.`
        : `${resolveFeedbackMessage(challenge, false)} Punteggio ottenuto: 0/${challenge.scoring.maxScore}.`

      return buildFeedback(challenge, isCorrect, category, {
        message,
        scoreEarned,
        maxScore: challenge.scoring.maxScore,
        title: isCorrect
          ? 'Il Curatore ricompone gli indizi'
          : 'Il Critico offusca il quadro finale',
      })
    },
  },
  intruder: {
    render: renderIntruderChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const isCorrect = matchesSingleChoiceSelection(
        draftAnswer.selectedItemId,
        challenge.intruderId,
      )

      return buildFeedback(challenge, isCorrect, category)
    },
  },
  sequence_reconstruction: {
    render: renderSequenceReconstructionChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const isCorrect = matchesExactOrder(
        draftAnswer.sequenceOrderIds,
        challenge.correctOrder,
      )

      return buildFeedback(challenge, isCorrect, category)
    },
  },
}

/**
 * @param {import('../types/challenge').Challenge['type']} challengeType
 */
export function getChallengeRenderStrategy(challengeType) {
  return challengeTypeRegistry[challengeType]?.render ?? null
}

/**
 * @param {import('../types/challenge').Challenge} challenge
 * @returns {boolean}
 */
export function hasChallengeRenderer(challenge) {
  return Boolean(challengeTypeRegistry[challenge.type]?.render)
}

/**
 * @param {import('../types/challenge').Challenge} challenge
 * @param {Record<string, unknown>} props
 * @returns {React.ReactElement}
 */
export function renderChallengeOrFallback(challenge, props) {
  const render = getChallengeRenderStrategy(challenge.type)

  if (!render) {
    return createElement(ChallengeTemplateFallback, {
      challenge,
      reason: 'Questo template e registrato nei dati ma non ha ancora un renderer.',
    })
  }

  return render(props)
}

/**
 * @param {{
 *   challenge: import('../types/challenge').Challenge,
 *   draftAnswer: import('../types/challenge').ChallengeDraftAnswer,
 *   challengeState: import('../types/challenge').ChallengeRuntimeState,
 *   category: import('../types/challenge').Category | null
 * }} args
 */
export function evaluateChallenge(args) {
  const entry = challengeTypeRegistry[args.challenge.type]

  if (!entry) {
    return {
      isCorrect: false,
      title: 'Il Critico ha manomesso la prova',
      message: 'Questo tipo di sfida non ha ancora un interprete attivo.',
      attemptedChallengeId: args.challenge.id,
      categoryTitle: args.category?.title ?? '',
      speaker: 'critic',
      tone: 'failure',
    }
  }

  return entry.evaluate(args)
}