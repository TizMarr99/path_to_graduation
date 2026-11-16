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
    speedrunStarted: runtimeState.speedrunStarted ?? false,
    progressiveClueVisibleCounts: runtimeState.progressiveClueVisibleCounts ?? {},
    observationDeadlines: runtimeState.observationDeadlines ?? {},
    visualTimelineRevealedCount: runtimeState.visualTimelineRevealedCount ?? 0,
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
    imageOptionItemOrderIds: [],
    imageOptionSourceOrderIds: [],
    columnOrders: [],
    columnBonusNames: {},
    cardSelections: {},
    memoryPaletteSelections: {},
    multiRoundAnswers: {},
    visualTimelineOrderIds: [],
    visualTimelineStyleAnswers: {},
    dupeSwappedRoundIds: [],
    progressiveClueAnswers: {},
    roundCursor: 0,
    lockedRounds: {},
    roundChoiceOrders: {},
    visualTimelineSlots: {},
    visualTimelineDecadeAnswers: {},
  }
}

function shuffleIds(ids = []) {
  const nextIds = [...ids]

  for (let index = nextIds.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentValue = nextIds[index]
    nextIds[index] = nextIds[swapIndex]
    nextIds[swapIndex] = currentValue
  }

  return nextIds
}

function shouldRandomizeImageOptionChallenge(challenge) {
  return challenge?.type === 'image_option_matching' && [
    'got_matching',
    'st_matching',
    'photo_supports',
  ].includes(challenge.quizSubType)
}

/**
 * @param {import('../types/challenge').Challenge | null} challenge
 * @returns {import('../types/challenge').ChallengeDraftAnswer}
 */
export function createInitialDraftAnswerForChallenge(challenge) {
  const baseDraft = createChallengeDraftAnswer()
  baseDraft.contentVersion = challenge?.contentVersion
  baseDraft.roundChoiceOrders = Object.fromEntries((challenge?.rounds ?? []).map((round) => [
    round.id, shuffleIds((round.colors ?? round.choices ?? []).map((choice) => choice.id)),
  ]))

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
    const shouldRandomizeOrder = shouldRandomizeImageOptionChallenge(challenge)

    return {
      ...baseDraft,
      imageOptionSelections: {},
      imageOptionItemOrderIds: shouldRandomizeOrder
        ? shuffleIds(challenge.items.map((item) => item.id))
        : [],
      imageOptionSourceOrderIds: shouldRandomizeOrder
        ? shuffleIds(challenge.options.map((option) => option.id))
        : [],
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

  if (challenge.type === 'memory_palette') {
    return {
      ...baseDraft,
      memoryPaletteSelections: {},
    }
  }

  if (challenge.type === 'multi_round_quiz') {
    return {
      ...baseDraft,
      multiRoundAnswers: {},
      dupeSwappedRoundIds: challenge.alternateDupeSides
        ? challenge.rounds.filter((round, index) => {
          const side = challenge.dupeOriginalSides?.[index]
          return side === 'a' || side === 'b'
            ? side !== round.correctChoiceId
            : index % 2 === 1
        }).map((round) => round.id)
        : [],
    }
  }

  if (challenge.type === 'visual_timeline') {
    return {
      ...baseDraft,
      visualTimelineOrderIds: [...challenge.initialOrder],
    }
  }

  if (challenge.type === 'progressive_clue_rounds') {
    return {
      ...baseDraft,
      progressiveClueAnswers: {},
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
      speedrunTimeRemaining: challenge.timerSeconds ?? 40,
      speedrunStarted: false,
    })
  }

  if (challenge.type === 'progressive_clue_rounds') {
    return createChallengeRuntimeState({
      progressiveClueVisibleCounts: challenge.rounds.reduce((counts, round) => {
        counts[round.id] = challenge.initialVisibleClues
        return counts
      }, {}),
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
