import { createElement } from 'react'
import { countVisualTimelinePlacements, resolveQuizRounds, evaluateVisualRound, matchesTimelineDecade } from './visualChallengeRules.js'
import ChallengeTemplateFallback from '../components/challenges/common/ChallengeTemplateFallback.jsx'
import CardMatchingChallenge from '../components/challenges/templates/CardMatchingChallenge.jsx'
import ColumnReorderMatchingChallenge from '../components/challenges/templates/ColumnReorderMatchingChallenge.jsx'
import FaceMorphChallenge from '../components/challenges/templates/FaceMorphChallenge.jsx'
import FillLyricsChallenge from '../components/challenges/templates/FillLyricsChallenge.jsx'
import FreeTextChallenge from '../components/challenges/templates/FreeTextChallenge.jsx'
import GuessTitleAuthorChallenge from '../components/challenges/templates/GuessTitleAuthorChallenge.jsx'
import HitsterChallenge from '../components/challenges/templates/HitsterChallenge.jsx'
import ImageOptionMatchingChallenge from '../components/challenges/templates/ImageOptionMatchingChallenge.jsx'
import IntruderChallenge from '../components/challenges/templates/IntruderChallenge.jsx'
import MemoryPaletteChallenge from '../components/challenges/templates/MemoryPaletteChallenge.jsx'
import MultiStageProgressiveRevealChallenge from '../components/challenges/templates/MultiStageProgressiveRevealChallenge.jsx'
import MultiRoundQuizChallenge from '../components/challenges/templates/MultiRoundQuizChallenge.jsx'
import MusicalChainChallenge from '../components/challenges/templates/MusicalChainChallenge.jsx'
import MultipleChoiceChallenge from '../components/challenges/templates/MultipleChoiceChallenge.jsx'
import OrderingChallenge from '../components/challenges/templates/OrderingChallenge.jsx'
import ProgressiveClueRoundsChallenge from '../components/challenges/templates/ProgressiveClueRoundsChallenge.jsx'
import SequenceReconstructionChallenge from '../components/challenges/templates/SequenceReconstructionChallenge.jsx'
import SpeedrunCharactersChallenge from '../components/challenges/templates/SpeedrunCharactersChallenge.jsx'
import VisualTimelineChallenge from '../components/challenges/templates/VisualTimelineChallenge.jsx'
import {
  countCorrectPlacements,
  evaluateCardMatching,
  evaluateColumnReorderMatching,
  evaluateFaceMorphAnswers,
  evaluateImageOptionMatching,
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
  speedrun_characters: 'Speedrun personaggi',
  image_option_matching: 'Abbinamento immagini',
  column_reorder_matching: 'Riordino colonne',
  card_matching: 'Abbinamento carte',
  memory_palette: 'Memory palette',
  multi_round_quiz: 'Quiz a round',
  visual_timeline: 'Timeline visuale',
  progressive_clue_rounds: 'Indizi progressivi',
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

function renderSpeedrunCharactersChallenge(props) {
  return createElement(SpeedrunCharactersChallenge, props)
}

function renderImageOptionMatchingChallenge(props) {
  return createElement(ImageOptionMatchingChallenge, props)
}

function renderColumnReorderMatchingChallenge(props) {
  return createElement(ColumnReorderMatchingChallenge, props)
}

function renderCardMatchingChallenge(props) {
  return createElement(CardMatchingChallenge, props)
}

function renderMemoryPaletteChallenge(props) {
  return createElement(MemoryPaletteChallenge, props)
}

function renderMultiRoundQuizChallenge(props) {
  return createElement(MultiRoundQuizChallenge, props)
}

function renderVisualTimelineChallenge(props) {
  return createElement(VisualTimelineChallenge, props)
}

function renderProgressiveClueRoundsChallenge(props) {
  return createElement(ProgressiveClueRoundsChallenge, props)
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
        .join(' → ')}${challenge.allowEqualYears ? ' (stesso periodo: ordine intercambiabile)' : ''}`,
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
        .join(' → ')}${challenge.allowEqualYears ? ' (stesso periodo: ordine intercambiabile)' : ''}`,
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
      `Personaggi: ${challenge.charactersGroups
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

  if (challenge.type === 'speedrun_characters') {
    return [
      `Personaggi: ${challenge.characters.map((c) => c.acceptedAnswers[0] ?? c.id).join(', ')}`,
    ]
  }

  if (challenge.type === 'image_option_matching') {
    const optionsById = new Map(challenge.options.map((o) => [o.id, o.label || o.id]))
    return challenge.items.map(
      (item) => `${item.label} → ${optionsById.get(item.correctOptionId) ?? '?'}`,
    )
  }

  if (challenge.type === 'column_reorder_matching') {
    return challenge.rows.map(
      (row) => `Riga ${row.id}: ${row.correctOrder.join(' · ')}`,
    )
  }

  if (challenge.type === 'card_matching') {
    return challenge.items.map(
      (item) => `${item.id}: ${item.correctNumber} di ${item.correctSuit}`,
    )
  }

  if (challenge.type === 'memory_palette') {
    return challenge.rounds.map((round) => {
      const colorNames = round.correctColorIds
        .map((colorId) => round.colors.find((color) => color.id === colorId)?.name ?? colorId)
        .join(', ')
      return `${round.title || round.id}: ${colorNames}`
    })
  }

  if (challenge.type === 'multi_round_quiz') {
    return challenge.rounds.map((round) => {
      if (round.mode === 'free_text') {
        return `${round.title || round.id}: ${round.acceptedAnswers?.[0] ?? 'n/d'}`
      }

      const correctChoice = round.choices?.find((choice) => choice.id === round.correctChoiceId)
      return `${round.title || round.id}: ${correctChoice?.text ?? 'n/d'}`
    })
  }

  if (challenge.type === 'visual_timeline') {
    const labelsById = new Map(challenge.items.map((item) => [item.id, `${item.year} · ${item.acceptedStyleAnswers?.[0] || item.label}`]))
    return [
      `Ordine corretto: ${challenge.correctOrder
        .map((itemId) => labelsById.get(itemId) ?? itemId)
        .join(' → ')}${challenge.allowEqualYears ? ' (stesso periodo: ordine intercambiabile)' : ''}`,
    ]
  }

  if (challenge.type === 'progressive_clue_rounds') {
    return challenge.rounds.map((round) => `${round.title || round.id}: ${round.solutionLabel}`)
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
        challenge.charactersGroups,
      )
      const isCorrect = result.matchedCount >= challenge.minimumCorrectGroups

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: result.matchedCount,
        maxScore: challenge.charactersGroups.length,
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
  speedrun_characters: {
    render: renderSpeedrunCharactersChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const answers = draftAnswer.speedrunAnswers ?? {}
      let correctCount = 0

      challenge.characters.forEach((character) => {
        if (answers[character.id] && matchesAcceptedAnswer(answers[character.id], character.acceptedAnswers)) {
          correctCount += 1
        }
      })

      const isCorrect = correctCount >= challenge.minimumCorrect

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: correctCount,
        maxScore: challenge.characters.length,
        metadata: { correctCount, skippedCount: (draftAnswer.speedrunSkippedIds ?? []).length },
      })
    },
  },
  image_option_matching: {
    render: renderImageOptionMatchingChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const result = evaluateImageOptionMatching(
        draftAnswer.imageOptionSelections,
        challenge.items,
      )
      const isCorrect = result.matchedCount >= challenge.minimumCorrectPairs

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: result.matchedCount,
        maxScore: challenge.items.length,
        metadata: result,
      })
    },
  },
  column_reorder_matching: {
    render: renderColumnReorderMatchingChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const result = evaluateColumnReorderMatching(
        draftAnswer.columnOrders,
        challenge.rows,
        draftAnswer.columnBonusNames,
      )
      const baseScore = result.matchedCount
      const bonusScore = result.bonusNameMatches * (challenge.bonusNameCredit ?? 0)
      const isCorrect = result.matchedCount >= challenge.minimumCorrectRows

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: baseScore + bonusScore,
        maxScore: challenge.rows.length + (challenge.rows.filter((r) => r.bonusNameAcceptedAnswers?.length).length * (challenge.bonusNameCredit ?? 0)),
        metadata: { ...result, bonusScore },
      })
    },
  },
  card_matching: {
    render: renderCardMatchingChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const result = evaluateCardMatching(
        draftAnswer.cardSelections,
        challenge.items,
      )
      const isCorrect = result.matchedCount >= challenge.minimumCorrect

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: result.matchedCount,
        maxScore: challenge.items.length,
        metadata: result,
      })
    },
  },
  memory_palette: {
    render: renderMemoryPaletteChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const result = evaluateMemoryPalette(
        draftAnswer.memoryPaletteSelections,
        challenge.rounds,
      )
      const isCorrect = result.matchedCount >= challenge.minimumCorrectRounds

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: result.matchedCount,
        maxScore: challenge.rounds.length,
        metadata: result,
      })
    },
  },
  multi_round_quiz: {
    render: renderMultiRoundQuizChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const result = evaluateMultiRoundAnswers(
        draftAnswer.multiRoundAnswers,
        resolveQuizRounds(challenge, draftAnswer),
      )
      const isCorrect = result.matchedCount >= challenge.minimumCorrectRounds

      return buildFeedback({ ...challenge, rounds: resolveQuizRounds(challenge, draftAnswer) }, isCorrect, category, {
        scoreEarned: result.matchedCount,
        maxScore: challenge.rounds.length,
        metadata: result,
      })
    },
  },
  visual_timeline: {
    render: renderVisualTimelineChallenge,
    evaluate: ({ challenge, draftAnswer, category }) => {
      const correctPlacements = countVisualTimelinePlacements(
        draftAnswer.visualTimelineOrderIds, challenge.correctOrder, challenge.items, challenge.allowEqualYears,
      )
      if (challenge.contentVersion === 2) {
        const years = [...new Set(challenge.items.map((item) => item.year))].sort((a, b) => a - b)
        const placements = challenge.items.filter((item) => draftAnswer.visualTimelineSlots?.[item.id] === years.indexOf(item.year)).length
        const names = challenge.items.filter((item) => matchesAcceptedAnswer(draftAnswer.visualTimelineStyleAnswers?.[item.id] ?? '', item.acceptedStyleAnswers)).length
        const decades = challenge.items.filter((item) => matchesTimelineDecade(draftAnswer.visualTimelineDecadeAnswers?.[item.id] ?? '', item.year)).length
        const isCorrect = placements >= challenge.minimumCorrectPlacements
        return buildFeedback(challenge, isCorrect, category, {
          scoreEarned: placements, maxScore: challenge.items.length,
          bonusCredits: names + decades,
          metadata: { correctPlacements: placements, names, decades, descriptiveScore: placements + names + decades, descriptiveMaxScore: 21 },
          message: `${resolveFeedbackMessage(challenge, isCorrect)} Ordinamento: ${placements}/7. Nomi: ${names}/7. Decadi: ${decades}/7. Crediti bonus: +${names + decades}.`,
        })
      }
      const styleMatches = challenge.items.filter((item) => matchesAcceptedAnswer(
        draftAnswer.visualTimelineStyleAnswers?.[item.id] ?? '', item.acceptedStyleAnswers ?? [],
      )).map((item) => item.id)
      const isCorrect = correctPlacements >= challenge.minimumCorrectPlacements

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: correctPlacements,
        maxScore: challenge.correctOrder.length,
        metadata: { correctPlacements, styleMatches, optionalStyleBonus: styleMatches.length },
        message: `${resolveFeedbackMessage(challenge, isCorrect)} Stili riconosciuti (bonus facoltativo): ${styleMatches.length}/${challenge.items.filter((item) => item.acceptedStyleAnswers?.length).length}.`,
      })
    },
  },
  progressive_clue_rounds: {
    render: renderProgressiveClueRoundsChallenge,
    evaluate: ({ challenge, draftAnswer, challengeState, category }) => {
      const result = evaluateProgressiveClues(
        draftAnswer.progressiveClueAnswers,
        challengeState.progressiveClueVisibleCounts,
        challenge,
      )
      const isCorrect = result.scoreEarned >= challenge.scoring.passingScore

      return buildFeedback(challenge, isCorrect, category, {
        scoreEarned: result.scoreEarned,
        maxScore: challenge.rounds.length * challenge.scoring.maxPointsPerRound,
        metadata: result,
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
  if (challenge.contentStatus && challenge.contentStatus !== 'ready') {
    return createElement('p', { className: 'rounded-2xl border border-slate-700 p-5 text-slate-200' },
      challenge.contentStatus === 'legacy'
        ? 'Questa prova è stata assorbita nella revisione della stanza. I risultati già salvati restano conservati.'
        : 'Questa prova attende la conferma dei contenuti o delle soglie. I progressi già salvati restano conservati.')
  }
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
  if (args.challenge.contentVersion === 2 && args.challenge.rounds) {
    const { challenge, draftAnswer, category } = args
    const rounds = resolveQuizRounds(challenge, draftAnswer)
    const results = rounds.map((round) => {
      const lock = draftAnswer.lockedRounds?.[round.id]
      return evaluateVisualRound(challenge, round,
        challenge.simultaneousRounds ? draftAnswer.multiRoundAnswers?.[round.id] : lock?.answer,
        lock?.visibleCount)
    })
    const matchedCount = results.filter((r) => r.isCorrect).length
    const descriptiveScore = results.reduce((sum, r) => sum + (r.descriptivePoints ?? 0), 0)
    const progressive = challenge.type === 'progressive_clue_rounds'
    const isCorrect = matchedCount >= challenge.minimumCorrectRounds
    const narrativeMessage = isCorrect ? challenge.successMessage : challenge.failureMessage
    return buildFeedback(challenge, isCorrect, category, {
      scoreEarned: matchedCount, maxScore: rounds.length,
      metadata: { matchedCount, matchedRoundIds: rounds.filter((_, i) => results[i].isCorrect).map((r) => r.id), descriptiveScore, descriptiveMaxScore: progressive ? 12 : rounds.length },
      solutionLines: results.map((r, i) => `Round ${i + 1}: ${r.solution}`),
      message: `${narrativeMessage ? `${narrativeMessage} ` : ''}${matchedCount}/${rounds.length} risposte corrette.${progressive ? ` Punti descrittivi: ${descriptiveScore}/12.` : ''}`,
    })
  }
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

function arraysEqualAsSets(left = [], right = []) {
  if (left.length !== right.length) return false
  const expected = new Set(right)
  return left.every((value) => expected.has(value))
}

function evaluateMemoryPalette(selections = {}, rounds = []) {
  const matchedRoundIds = rounds
    .filter((round) => arraysEqualAsSets(selections[round.id] ?? [], round.correctColorIds))
    .map((round) => round.id)

  return {
    matchedRoundIds,
    matchedCount: matchedRoundIds.length,
  }
}

function evaluateMultiRoundAnswers(answers = {}, rounds = []) {
  const matchedRoundIds = []

  rounds.forEach((round) => {
    const answer = answers[round.id] ?? ''
    const matched = round.mode === 'free_text'
      ? matchesAcceptedAnswer(answer, round.acceptedAnswers)
      : answer === round.correctChoiceId

    if (matched) {
      matchedRoundIds.push(round.id)
    }
  })

  return {
    matchedRoundIds,
    matchedCount: matchedRoundIds.length,
  }
}

function evaluateProgressiveClues(answers = {}, visibleCounts = {}, challenge) {
  let scoreEarned = 0
  const matchedRoundIds = []

  challenge.rounds.forEach((round) => {
    if (!matchesAcceptedAnswer(answers[round.id] ?? '', round.acceptedAnswers)) {
      return
    }

    const visibleCount = Math.max(
      challenge.initialVisibleClues,
      visibleCounts[round.id] ?? challenge.initialVisibleClues,
    )
    const roundScore = Math.max(
      challenge.scoring.minPointsPerRound,
      challenge.scoring.maxPointsPerRound -
        Math.max(0, visibleCount - challenge.initialVisibleClues) * challenge.scoring.revealPenalty,
    )

    scoreEarned += roundScore
    matchedRoundIds.push(round.id)
  })

  return {
    matchedRoundIds,
    matchedCount: matchedRoundIds.length,
    scoreEarned,
  }
}
