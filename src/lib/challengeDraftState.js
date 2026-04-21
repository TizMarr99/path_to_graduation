/**
 * @param {import('../types/challenge').ChallengeRuntimeState} [runtimeState]
 * @returns {import('../types/challenge').ChallengeRuntimeState}
 */
export function createChallengeRuntimeState(runtimeState = {}) {
  return {
    revealedStageCount: runtimeState.revealedStageCount ?? 0,
    musicalChainStageIndex: runtimeState.musicalChainStageIndex ?? 0,
    hitsterRevealedTrackCount: runtimeState.hitsterRevealedTrackCount ?? 0,
    speedrunCurrentIndex: runtimeState.speedrunCurrentIndex ?? 0,
    speedrunTimeRemaining: runtimeState.speedrunTimeRemaining ?? 0,
  }
}

/**
 * @returns {import('../types/challenge').ChallengeDraftAnswer}
 */
export function createChallengeDraftAnswer() {
  return {
    selectedChoiceId: '',
    selectedItemId: '',
    textAnswer: '',
    orderedItemIds: [],
    sequenceOrderIds: [],
    titleAnswer: '',
    authorAnswer: '',
    faceMorphAnswers: [],
    hitsterTrackAnswers: {},
    hitsterTrackOrderIds: [],
    speedrunAnswers: {},
    speedrunSkippedIds: [],
    imageOptionSelections: {},
    columnOrders: [],
    columnBonusNames: {},
    cardSelections: {},
  }
}

/**
 * @param {import('../types/challenge').Challenge | null} challenge
 * @returns {import('../types/challenge').ChallengeDraftAnswer}
 */
export function createInitialDraftAnswerForChallenge(challenge) {
  const baseDraft = createChallengeDraftAnswer()

  if (!challenge) {
    return baseDraft
  }

  if (challenge.type === 'ordering') {
    return {
      ...baseDraft,
      orderedItemIds: [...challenge.initialOrder],
    }
  }

  if (challenge.type === 'sequence_reconstruction') {
    return {
      ...baseDraft,
      sequenceOrderIds: [...challenge.initialOrder],
    }
  }

  if (challenge.type === 'face_morph') {
    return {
      ...baseDraft,
      faceMorphAnswers: Array.from({ length: challenge.answerSlots }, () => ''),
    }
  }

  if (challenge.type === 'hitster') {
    return {
      ...baseDraft,
      hitsterTrackOrderIds: Array.from({ length: challenge.tracks.length }, () => ''),
      hitsterTrackAnswers: challenge.tracks.reduce((answers, track) => {
        answers[track.id] = {
          titleAnswer: '',
          artistAnswer: '',
        }
        return answers
      }, {}),
    }
  }

  if (challenge.type === 'speedrun_characters') {
    return {
      ...baseDraft,
      speedrunAnswers: {},
      speedrunSkippedIds: [],
    }
  }

  if (challenge.type === 'image_option_matching') {
    return {
      ...baseDraft,
      imageOptionSelections: {},
    }
  }

  if (challenge.type === 'column_reorder_matching') {
    const columnOrders = challenge.shuffledColumnOrders.length
      ? challenge.shuffledColumnOrders.map((order) => [...order])
      : challenge.columns.map(() => [])

    return {
      ...baseDraft,
      columnOrders,
      columnBonusNames: {},
    }
  }

  if (challenge.type === 'card_matching') {
    return {
      ...baseDraft,
      cardSelections: {},
    }
  }

  return baseDraft
}

/**
 * @param {import('../types/challenge').Challenge | null} challenge
 * @returns {import('../types/challenge').ChallengeRuntimeState}
 */
export function createInitialRuntimeStateForChallenge(challenge) {
  if (!challenge) {
    return createChallengeRuntimeState()
  }

  if (challenge.type === 'multi_stage_progressive_reveal') {
    return createChallengeRuntimeState({
      revealedStageCount: challenge.initialVisibleStages,
    })
  }

  if (challenge.type === 'musical_chain') {
    return createChallengeRuntimeState({
      musicalChainStageIndex: 0,
    })
  }

  if (challenge.type === 'hitster') {
    return createChallengeRuntimeState({
      hitsterRevealedTrackCount: 0,
    })
  }

  if (challenge.type === 'speedrun_characters') {
    return createChallengeRuntimeState({
      speedrunCurrentIndex: 0,
      speedrunTimeRemaining: challenge.timerSeconds ?? 30,
    })
  }

  return createChallengeRuntimeState()
}

/**
 * @param {string[]} values
 * @param {number} sourceIndex
 * @param {number} targetIndex
 * @returns {string[]}
 */
export function moveArrayItem(values, sourceIndex, targetIndex) {
  if (
    sourceIndex < 0 ||
    targetIndex < 0 ||
    sourceIndex >= values.length ||
    targetIndex >= values.length ||
    sourceIndex === targetIndex
  ) {
    return values
  }

  const nextValues = [...values]
  const [movedValue] = nextValues.splice(sourceIndex, 1)
  nextValues.splice(targetIndex, 0, movedValue)

  return nextValues
}