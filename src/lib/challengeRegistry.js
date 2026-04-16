import { createElement } from 'react'
import ChallengeTemplateFallback from '../components/challenges/common/ChallengeTemplateFallback.jsx'
import FaceMorphChallenge from '../components/challenges/templates/FaceMorphChallenge.jsx'
import FillLyricsChallenge from '../components/challenges/templates/FillLyricsChallenge.jsx'
import FreeTextChallenge from '../components/challenges/templates/FreeTextChallenge.jsx'
import GuessTitleAuthorChallenge from '../components/challenges/templates/GuessTitleAuthorChallenge.jsx'
import HitsterChallenge from '../components/challenges/templates/HitsterChallenge.jsx'
import IntruderChallenge from '../components/challenges/templates/IntruderChallenge.jsx'
import MultiStageProgressiveRevealChallenge from '../components/challenges/templates/MultiStageProgressiveRevealChallenge.jsx'
import MusicalChainChallenge from '../components/challenges/templates/MusicalChainChallenge.jsx'
import MultipleChoiceChallenge from '../components/challenges/templates/MultipleChoiceChallenge.jsx'
import OrderingChallenge from '../components/challenges/templates/OrderingChallenge.jsx'
import SequenceReconstructionChallenge from '../components/challenges/templates/SequenceReconstructionChallenge.jsx'
import {
  countCorrectPlacements,
  evaluateFaceMorphAnswers,
  evaluateLyricsWordMatch,
  evaluateTitleAuthorMatch,
  matchesAcceptedAnswer,
  tokenizeLyricsWords,
} from './answerNormalization'

export const challengeTypeLabels = {
  multiple_choice: 'Scelta multipla',
  free_text: 'Risposta libera',
  ordering: 'Riordino',
  multi_stage_progressive_reveal: 'Rivelazione progressiva',
  intruder: 'Intruso',
  sequence_reconstruction: 'Ricostruzione sequenza',
  guess_title_author: 'Titolo e autore',
  face_morph: 'Face morph',
  fill_lyrics: 'Completa il testo',
  musical_chain: 'Catena musicale',
  hitster: 'Hitster',
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

function renderGuessTitleAuthorChallenge(props) {
  return createElement(GuessTitleAuthorChallenge, props)
}

function renderFaceMorphChallenge(props) {
  return createElement(FaceMorphChallenge, props)
}

function renderFillLyricsChallenge(props) {
  return createElement(FillLyricsChallenge, props)
}

function renderMusicalChainChallenge(props) {
  return createElement(MusicalChainChallenge, props)
}

function renderHitsterChallenge(props) {
  return createElement(HitsterChallenge, props)
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

  return isCorrect ? 'guardian' : 'inquisitor'
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
      'Il Guardiano lascia filtrare un bagliore: la prova ha ceduto.'
    )
  }

  return (
    challenge.failureMessage ||
    challenge.explanation ||
    "L'Inquisitore confonde le tracce. Serve un nuovo tentativo."
  )
}

/**
 * @param {import('../types/challenge').Challenge} challenge
 * @returns {string[]}
 */
function resolveSolutionLines(challenge) {
  if (challenge.type === 'multiple_choice') {
    const correctChoice = challenge.choices.find((choice) => choice.id === challenge.correctChoiceId)
    return correctChoice ? [`Risposta corretta: ${correctChoice.text}`] : []
  }

  if (challenge.type === 'free_text') {
    return challenge.acceptedAnswers.length
      ? [`Risposta corretta: ${challenge.acceptedAnswers[0]}`]
      : []
  }

  if (challenge.type === 'ordering') {
    const labelsById = new Map(challenge.items.map((item) => [item.id, item.label]))
    return [
      `Ordine corretto: ${challenge.correctOrder
        .map((itemId) => labelsById.get(itemId) ?? itemId)
        .join(' → ')}`,
    ]
  }

  if (challenge.type === 'multi_stage_progressive_reveal') {
    if (challenge.solution.mode === 'multiple_choice') {
      const correctChoice = challenge.solution.choices.find(
        (choice) => choice.id === challenge.solution.correctChoiceId,
      )
      return correctChoice ? [`Soluzione finale: ${correctChoice.text}`] : []
    }

    return challenge.solution.acceptedAnswers.length
      ? [`Soluzione finale: ${challenge.solution.acceptedAnswers[0]}`]
      : []
  }

  if (challenge.type === 'intruder') {
    const intruder = challenge.items.find((item) => item.id === challenge.intruderId)
    return intruder ? [`Elemento intruso: ${intruder.text}`] : []
  }

  if (challenge.type === 'sequence_reconstruction') {
    const labelsById = new Map(challenge.segments.map((segment) => [segment.id, segment.label]))
    return [
      `Sequenza corretta: ${challenge.correctOrder
        .map((segmentId) => labelsById.get(segmentId) ?? segmentId)
        .join(' → ')}`,
    ]
  }

  if (challenge.type === 'guess_title_author') {
    return [
      `Titolo: ${challenge.acceptedTitleAnswers[0] ?? 'n/d'}`,
      `Autore: ${challenge.acceptedAuthorAnswers[0] ?? 'n/d'}`,
    ]
  }

  if (challenge.type === 'face_morph') {
    return [
      `Cantanti: ${challenge.singerGroups
        .map((group) => group.acceptedAnswers[0])
        .filter(Boolean)
        .join(' · ')}`,
    ]
  }

  if (challenge.type === 'fill_lyrics') {
    return [`Verso corretto: ${challenge.solutionText}`]
  }

  if (challenge.type === 'musical_chain') {
    return challenge.acceptedAnswers.length
      ? [`Brano corretto: ${challenge.acceptedAnswers[0]}`]
      : []
  }

  if (challenge.type === 'hitster') {
    return challenge.tracks.map(
      (track) => `${track.year} · ${track.artist} · ${track.title}`,
    )
  }

  return []
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
    title: isCorrect ? 'Il Guardiano approva il passaggio' : "L'Inquisitore devia la rotta",
    message: resolveFeedbackMessage(challenge, isCorrect),
    attemptedChallengeId: challenge.id,
    categoryTitle: category?.title ?? '',
    speaker: resolveFeedbackSpeaker(challenge, isCorrect),
    tone: isCorrect ? 'success' : 'failure',
    solutionLines: resolveSolutionLines(challenge),
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
 * @param {import('../types/challenge').Challenge} challenge
 * @param {boolean} isCorrect
 * @param {import('../types/challenge').Category | null} category
 * @param {Record<string, unknown>} [overrides]
 * @returns {import('../types/challenge').ChallengeFeedback}
 */
function buildBinaryScoreFeedback(challenge, isCorrect, category, overrides = {}) {
  return buildFeedback(challenge, isCorrect, category, {
    scoreEarned: isCorrect ? 1 : 0,
    maxScore: 1,
    ...overrides,
  })
}

/**
 * @param {import('../types/challenge').FillLyricsChallenge} challenge
 * @returns {number}
 */
function resolveFillLyricsMaxScore(challenge) {
  if (typeof challenge.scoring?.maxScore === 'number' && challenge.scoring.maxScore > 0) {
    return challenge.scoring.maxScore
  }

  return tokenizeLyricsWords(challenge.solutionText).length
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

      return buildBinaryScoreFeedback(challenge, isCorrect, category)
    },
  },
  free_text: {
    render: renderFreeTextChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const isCorrect = matchesAcceptedAnswer(
        draftAnswer.textAnswer,
        challenge.acceptedAnswers,
      )

      return buildBinaryScoreFeedback(challenge, isCorrect, category)
    },
  },
  ordering: {
    render: renderOrderingChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const isCorrect = matchesExactOrder(
        draftAnswer.orderedItemIds,
        challenge.correctOrder,
      )

      return buildBinaryScoreFeedback(challenge, isCorrect, category)
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
          ? 'Il Guardiano ricompone gli indizi'
          : "L'Inquisitore offusca il quadro finale",
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

      return buildBinaryScoreFeedback(challenge, isCorrect, category)
    },
  },
  sequence_reconstruction: {
    render: renderSequenceReconstructionChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const isCorrect = matchesExactOrder(
        draftAnswer.sequenceOrderIds,
        challenge.correctOrder,
      )

      return buildBinaryScoreFeedback(challenge, isCorrect, category)
    },
  },
  guess_title_author: {
    render: renderGuessTitleAuthorChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const result = evaluateTitleAuthorMatch(
        draftAnswer.titleAnswer,
        challenge.acceptedTitleAnswers,
        draftAnswer.authorAnswer,
        challenge.acceptedAuthorAnswers,
      )
      const isCorrect = result.matchedCount >= challenge.scoring.passThreshold

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned:
          result.matchedCount === 2
            ? challenge.scoring.fullMatchRatio
            : result.matchedCount === 1
              ? challenge.scoring.partialMatchRatio
              : 0,
        maxScore: challenge.scoring.fullMatchRatio,
        metadata: result,
      })
    },
  },
  face_morph: {
    render: renderFaceMorphChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const result = evaluateFaceMorphAnswers(
        draftAnswer.faceMorphAnswers,
        challenge.singerGroups,
      )
      const isCorrect = result.matchedCount >= challenge.minimumCorrectGroups

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: result.matchedCount,
        maxScore: challenge.singerGroups.length,
        metadata: result,
      })
    },
  },
  fill_lyrics: {
    render: renderFillLyricsChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const result = evaluateLyricsWordMatch(
        draftAnswer.textAnswer,
        challenge.solutionText,
        challenge.scoring.minimumWordMatchRatio,
      )

      return buildFeedback(challenge, result.isMatch, category, {
        scoreEarned: result.matchedWordCount,
        maxScore: resolveFillLyricsMaxScore(challenge),
        metadata: result,
      })
    },
  },
  musical_chain: {
    render: renderMusicalChainChallenge,
    evaluate: ({ challenge, draftAnswer, challengeState, category }) => {
      const isCorrect = matchesAcceptedAnswer(draftAnswer.textAnswer, challenge.acceptedAnswers)
      const revealsUsed = challengeState.musicalChainStageIndex
      const isFinalStage = challengeState.musicalChainStageIndex >= challenge.stages.length - 1

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: isCorrect
          ? Math.max(
              challenge.scoring.minScore,
              challenge.scoring.maxScore - revealsUsed * challenge.scoring.revealPenalty,
            )
          : 0,
        maxScore: challenge.scoring.maxScore,
        metadata: {
          stageIndex: challengeState.musicalChainStageIndex,
          isFinalStage,
        },
      })
    },
  },
  hitster: {
    render: renderHitsterChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const correctPlacements = countCorrectPlacements(
        draftAnswer.hitsterTrackOrderIds,
        challenge.correctOrder,
      )
      const isCorrect = correctPlacements >= challenge.scoring.minimumCorrectPlacements

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: correctPlacements,
        maxScore: challenge.correctOrder.length,
        metadata: {
          correctPlacements,
        },
      })
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
      title: "L'Inquisitore ha manomesso la prova",
      message: 'Questo tipo di sfida non ha ancora un interprete attivo.',
      attemptedChallengeId: args.challenge.id,
      categoryTitle: args.category?.title ?? '',
      speaker: 'inquisitor',
      tone: 'failure',
    }
  }

  return entry.evaluate(args)
}