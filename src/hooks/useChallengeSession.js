import { useMemo, useState } from 'react'
import {
  createInitialDraftAnswerForChallenge,
  createInitialRuntimeStateForChallenge,
} from '../lib/challengeDraftState'
import { evaluateChallenge } from '../lib/challengeRegistry'

/**
 * @param {import('../types/challenge').Category | null} category
 * @returns {import('../types/challenge').ChallengeFeedback}
 */
function createFeedback(category) {
  return {
    isCorrect: false,
    title: '',
    message: '',
    attemptedChallengeId: '',
    categoryTitle: category?.title ?? '',
    speaker: 'neutral',
    tone: 'idle',
    solutionLines: [],
  }
}

function createChallengeResultMap() {
  return {}
}

function findChallengeById(challenges, challengeId) {
  return challenges.find((challenge) => challenge.id === challengeId) ?? null
}

function resolveInitialChallengeId(challenges, preferredChallengeId, persistedChallengeId = '') {
  if (persistedChallengeId && findChallengeById(challenges, persistedChallengeId)) {
    return persistedChallengeId
  }

  if (preferredChallengeId && findChallengeById(challenges, preferredChallengeId)) {
    return preferredChallengeId
  }

  return challenges[0]?.id ?? ''
}

function findNextUnresolvedChallengeId(challenges, resolvedChallengeIds, currentChallengeId) {
  if (!challenges.length) {
    return ''
  }

  const currentIndex = challenges.findIndex((challenge) => challenge.id === currentChallengeId)
  const orderedChallenges =
    currentIndex >= 0
      ? [...challenges.slice(currentIndex + 1), ...challenges.slice(0, currentIndex + 1)]
      : challenges

  return (
    orderedChallenges.find((challenge) => !resolvedChallengeIds.includes(challenge.id))?.id ?? ''
  )
}

function resolveInitialDraftAnswer(challenge, persistedDraftAnswer = null) {
  const initialDraft = createInitialDraftAnswerForChallenge(challenge)

  if (!persistedDraftAnswer) {
    return initialDraft
  }

  return {
    ...initialDraft,
    ...persistedDraftAnswer,
    imageOptionSelections:
      persistedDraftAnswer.imageOptionSelections ?? initialDraft.imageOptionSelections,
    imageOptionItemOrderIds:
      persistedDraftAnswer.imageOptionItemOrderIds?.length
        ? persistedDraftAnswer.imageOptionItemOrderIds
        : initialDraft.imageOptionItemOrderIds,
    imageOptionSourceOrderIds:
      persistedDraftAnswer.imageOptionSourceOrderIds?.length
        ? persistedDraftAnswer.imageOptionSourceOrderIds
        : initialDraft.imageOptionSourceOrderIds,
  }
}

/**
 * @param {import('../types/challenge').Category | null} category
 * @param {string} [preferredChallengeId]
 * @param {object | null} [persistedSession]
 */
export function useChallengeSession(category, preferredChallengeId = '', persistedSession = null) {
  const challenges = category?.challenges ?? []
  const initialChallengeId = resolveInitialChallengeId(
    challenges,
    preferredChallengeId,
    persistedSession?.currentChallengeId ?? '',
  )
  const initialChallenge = findChallengeById(challenges, initialChallengeId)
  const [currentChallengeId, setCurrentChallengeId] = useState(initialChallengeId)
  const [challengeResults, setChallengeResults] = useState(
    () => persistedSession?.challengeResults ?? createChallengeResultMap(),
  )
  const [draftAnswer, setDraftAnswer] = useState(() =>
    resolveInitialDraftAnswer(initialChallenge, persistedSession?.draftAnswer),
  )
  const [challengeState, setChallengeState] = useState(() =>
    persistedSession?.challengeState ?? createInitialRuntimeStateForChallenge(initialChallenge),
  )
  const [isHintVisible, setIsHintVisible] = useState(persistedSession?.isHintVisible ?? false)
  const [feedback, setFeedback] = useState(() => createFeedback(category))
  const [feedbackMode, setFeedbackMode] = useState('closed')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionCorrectCount, setSessionCorrectCount] = useState(
    persistedSession?.sessionCorrectCount ?? 0,
  )
  const [sessionWrongCount, setSessionWrongCount] = useState(
    persistedSession?.sessionWrongCount ?? 0,
  )

  const currentChallenge = findChallengeById(challenges, currentChallengeId)
  const totalChallenges = challenges.length
  const currentIndex = challenges.findIndex((challenge) => challenge.id === currentChallengeId)
  const challengeNumber = currentIndex >= 0 ? currentIndex + 1 : 0
  const resolvedChallengeIds = Object.keys(challengeResults)
  const resolvedChallengeCount = resolvedChallengeIds.length
  const allChallengesResolved = totalChallenges > 0 && resolvedChallengeCount >= totalChallenges
  const hasFeedback = feedbackMode !== 'closed' && Boolean(feedback.attemptedChallengeId)
  const isCurrentChallengeResolved = Boolean(currentChallenge && challengeResults[currentChallenge.id])
  const isComplete = allChallengesResolved && !hasFeedback

  const progressLabel = useMemo(() => {
    if (!totalChallenges) {
      return 'Quiz risolti 0 di 0'
    }

    return `Quiz risolti ${resolvedChallengeCount} di ${totalChallenges}`
  }, [resolvedChallengeCount, totalChallenges])

  function resetChallengeState() {
    const nextInitialChallenge = findChallengeById(challenges, initialChallengeId)

    setCurrentChallengeId(initialChallengeId)
    setChallengeResults(createChallengeResultMap())
    setDraftAnswer(createInitialDraftAnswerForChallenge(nextInitialChallenge))
    setChallengeState(createInitialRuntimeStateForChallenge(nextInitialChallenge))
    setIsHintVisible(false)
    setFeedback(createFeedback(category))
    setFeedbackMode('closed')
    setIsSubmitting(false)
    setSessionCorrectCount(0)
    setSessionWrongCount(0)
  }

  function updateDraftAnswer(partialDraft) {
    setDraftAnswer((currentDraft) => ({
      ...currentDraft,
      ...partialDraft,
    }))
  }

  function updateChallengeState(partialState) {
    setChallengeState((currentState) => ({
      ...currentState,
      ...partialState,
    }))
  }

  function selectChallenge(challengeId, options = {}) {
    const { openResolvedFeedback = true } = options
    const nextChallenge = findChallengeById(challenges, challengeId)
    const nextFeedback = challengeResults[challengeId] ?? null

    if (!nextChallenge) {
      return
    }

    setCurrentChallengeId(nextChallenge.id)
    setDraftAnswer(createInitialDraftAnswerForChallenge(nextChallenge))
    setChallengeState(createInitialRuntimeStateForChallenge(nextChallenge))
    setIsHintVisible(false)
    setFeedback(openResolvedFeedback && nextFeedback ? nextFeedback : createFeedback(category))
    setFeedbackMode(openResolvedFeedback && nextFeedback ? 'history' : 'closed')
    setIsSubmitting(false)
  }

  function dismissFeedback() {
    setFeedback(createFeedback(category))
    setFeedbackMode('closed')
    setIsSubmitting(false)
  }

  function revealHint() {
    setIsHintVisible(true)
  }

  function submitChallenge() {
    if (!currentChallenge || isSubmitting || hasFeedback || isCurrentChallengeResolved) {
      return null
    }

    setIsSubmitting(true)
    const nextFeedback = evaluateChallenge({
      challenge: currentChallenge,
      draftAnswer,
      challengeState,
      category,
    })

    setChallengeResults((currentResults) => ({
      ...currentResults,
      [currentChallenge.id]: nextFeedback,
    }))
    setFeedback(nextFeedback)
    setFeedbackMode('fresh')
    if (nextFeedback.isCorrect) {
      setSessionCorrectCount((count) => count + 1)
    } else {
      setSessionWrongCount((count) => count + 1)
    }
    setIsSubmitting(false)

    return nextFeedback
  }

  function goToNextChallenge() {
    if (!currentChallenge || !hasFeedback) {
      return null
    }

    if (resolvedChallengeCount >= totalChallenges) {
      setFeedback(createFeedback(category))
      setFeedbackMode('closed')
      setIsSubmitting(false)
      return null
    }

    const nextChallengeId = findNextUnresolvedChallengeId(
      challenges,
      resolvedChallengeIds,
      currentChallenge.id,
    )
    const nextChallenge = findChallengeById(challenges, nextChallengeId)

    if (!nextChallenge) {
      setFeedback(createFeedback(category))
      setFeedbackMode('closed')
      setIsSubmitting(false)
      return null
    }

    setCurrentChallengeId(nextChallenge.id)
    setDraftAnswer(createInitialDraftAnswerForChallenge(nextChallenge))
    setChallengeState(createInitialRuntimeStateForChallenge(nextChallenge))
    setIsHintVisible(false)
    setFeedback(createFeedback(category))
    setFeedbackMode('closed')
    setIsSubmitting(false)

    return nextChallenge
  }

  function restartSession() {
    resetChallengeState()
  }

  return {
    allChallengesResolved,
    challengeNumber,
    challengeResults,
    currentChallenge,
    currentIndex,
    currentChallengeId,
    challengeState,
    dismissFeedback,
    draftAnswer,
    feedback,
    feedbackMode,
    hasFeedback,
    isComplete,
    isCurrentChallengeResolved,
    isHintVisible,
    isSubmitting,
    progressLabel,
    resolvedChallengeCount,
    resolvedChallengeIds,
    selectChallenge,
    sessionCorrectCount,
    sessionWrongCount,
    revealHint,
    goToNextChallenge,
    restartSession,
    submitChallenge,
    totalChallenges,
    updateChallengeState,
    updateDraftAnswer,
  }
}