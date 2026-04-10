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
  }
}

/**
 * @param {import('../types/challenge').Category | null} category
 */
export function useChallengeSession(category) {
  const challenges = category?.challenges ?? []
  const initialChallenge = challenges[0] ?? null
  const [currentIndex, setCurrentIndex] = useState(0)
  const [draftAnswer, setDraftAnswer] = useState(() =>
    createInitialDraftAnswerForChallenge(initialChallenge),
  )
  const [challengeState, setChallengeState] = useState(() =>
    createInitialRuntimeStateForChallenge(initialChallenge),
  )
  const [isHintVisible, setIsHintVisible] = useState(false)
  const [feedback, setFeedback] = useState(() => createFeedback(category))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentChallenge = challenges[currentIndex] ?? null
  const totalChallenges = challenges.length
  const challengeNumber = currentChallenge ? currentIndex + 1 : totalChallenges
  const isComplete = totalChallenges > 0 && currentIndex >= totalChallenges
  const hasFeedback = Boolean(feedback.attemptedChallengeId)

  const progressLabel = useMemo(() => {
    if (!totalChallenges) {
      return 'Prova 0 di 0'
    }

    if (isComplete) {
      return `Prova ${totalChallenges} di ${totalChallenges}`
    }

    return `Prova ${challengeNumber} di ${totalChallenges}`
  }, [challengeNumber, isComplete, totalChallenges])

  function resetChallengeState() {
    setDraftAnswer(createInitialDraftAnswerForChallenge(challenges[0] ?? null))
    setChallengeState(createInitialRuntimeStateForChallenge(challenges[0] ?? null))
    setIsHintVisible(false)
    setFeedback(createFeedback(category))
    setIsSubmitting(false)
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

  function revealHint() {
    setIsHintVisible(true)
  }

  function submitChallenge() {
    if (!currentChallenge || isSubmitting || hasFeedback) {
      return
    }

    setIsSubmitting(true)
    setFeedback(
      evaluateChallenge({
        challenge: currentChallenge,
        draftAnswer,
        challengeState,
        category,
      }),
    )
    setIsSubmitting(false)
  }

  function goToNextChallenge() {
    if (!currentChallenge) {
      return
    }

    const nextChallenge = challenges[currentIndex + 1] ?? null

    setCurrentIndex((index) => index + 1)
    setDraftAnswer(createInitialDraftAnswerForChallenge(nextChallenge))
    setChallengeState(createInitialRuntimeStateForChallenge(nextChallenge))
    setIsHintVisible(false)
    setFeedback(createFeedback(category))
    setIsSubmitting(false)
  }

  function restartSession() {
    setCurrentIndex(0)
    resetChallengeState()
  }

  return {
    challengeNumber,
    currentChallenge,
    currentIndex,
    challengeState,
    draftAnswer,
    feedback,
    hasFeedback,
    isComplete,
    isHintVisible,
    isSubmitting,
    progressLabel,
    revealHint,
    goToNextChallenge,
    restartSession,
    submitChallenge,
    totalChallenges,
    updateChallengeState,
    updateDraftAnswer,
  }
}