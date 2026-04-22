import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ChallengeCompleted from '../components/challenges/ChallengeCompleted.jsx'
import ChallengeFeedback from '../components/challenges/ChallengeFeedback.jsx'
import ChallengeHintPanel from '../components/challenges/ChallengeHintPanel.jsx'
import ChallengeInfoModal from '../components/challenges/ChallengeInfoModal.jsx'
import ChallengeLayout from '../components/challenges/ChallengeLayout.jsx'
import ChallengeProgress from '../components/challenges/ChallengeProgress.jsx'
import ChallengeRenderer from '../components/challenges/ChallengeRenderer.jsx'
import ChallengeSelectorGrid from '../components/challenges/ChallengeSelectorGrid.jsx'
import CharacterPanel from '../components/music-room/CharacterPanel.jsx'
import HintModal from '../components/music-room/HintModal.jsx'
import MusicChallengeIntro from '../components/music-room/MusicChallengeIntro.jsx'
import MusicRoomNarrative from '../components/music-room/MusicRoomNarrative.jsx'
import MusicRoomVictoryModal from '../components/music-room/MusicRoomVictoryModal.jsx'
import ResultModal from '../components/music-room/ResultModal.jsx'
import RoomMapModal from '../components/music-room/RoomMapModal.jsx'
import RoomPlayLayout from '../components/music-room/RoomPlayLayout.jsx'
import SeriesFilmVictoryModal from '../components/music-room/SeriesFilmVictoryModal.jsx'
import { useBackgroundAudio } from '../hooks/useBackgroundAudio'
import { useCharacterComments } from '../hooks/useCharacterComments'
import { useChallengeSession } from '../hooks/useChallengeSession'
import { useFearEffects } from '../hooks/useFearEffects'
import { usePlayerState } from '../hooks/usePlayerState'
import { getCategoryById } from '../lib/challengeData'
import {
  sendMusicPrizeMail1,
  sendMusicPrizeMail2,
  sendSerieFilmArtifactMail,
  sendSerieFilmPrizeMail,
} from '../lib/emailApi'
import { getRoomTransition } from '../lib/roomTransitions'
import { challengeTypeLabels } from '../lib/challengeRegistry'
import { getAttemptsRemaining, getLivesRemaining } from '../lib/playerStateSnapshot'
import { getRoomCharacterBySpeaker } from '../lib/roomSpeakers'
import {
  computeWeightedRoomScore,
  resolveChallengeCreditBaseReward,
  resolveChallengeCreditReward,
} from '../lib/challengeRewards'

const roomUnlockTargets = {}

function resolveWeightedScoreGroupConfig(category, challenge) {
  if (!category?.weightedScoring || !challenge) {
    return null
  }

  const quizType = challenge.quizSubType ?? challenge.type

  return category.weightedScoring.scoreGroups?.find((group) => {
    const matchesById = group.challengeIds?.includes(challenge.id)
    const matchesByType = group.quizTypes?.includes(quizType)

    return Boolean(matchesById || matchesByType)
  }) ?? null
}

function NotFoundState({ categoryId }) {
  return (
    <section className="rounded-[2rem] border border-rose-300/20 bg-slate-950/70 p-8 shadow-[0_0_80px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-200/80">
        Categoria non trovata
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Nessuna sala disponibile per “{categoryId}”
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
        Controlla l&apos;ID nel percorso oppure apri una sala reale dal file locale.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-400/20"
          to="/shadows"
        >
          Vai alla mappa
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-amber-300/45 hover:text-amber-100"
          to="/dev"
        >
          Torna alla DevPage
        </Link>
      </div>
    </section>
  )
}

const HESITATION_AUDIO_PLAY_THRESHOLD = 3
const HESITATION_CLEAR_THRESHOLD = 2
const HESITATION_TIME_THRESHOLDS_MS = {
  hitster: 30_000,
  musical_chain: 40_000,
  image_option_matching: 90_000,
  column_reorder_matching: 90_000,
  card_matching: 90_000,
  default: 50_000,
}

const HESITATION_TIME_THRESHOLDS_MS_BY_SUBTYPE = {
  love_matching: 60_000,
  dark_matching: 120_000,
}

function resolveHesitationDelayMs(challenge) {
  if (!challenge) {
    return HESITATION_TIME_THRESHOLDS_MS.default
  }

  const subTypeDelay = HESITATION_TIME_THRESHOLDS_MS_BY_SUBTYPE[challenge.quizSubType]

  if (subTypeDelay) {
    return subTypeDelay
  }

  return HESITATION_TIME_THRESHOLDS_MS[challenge.type] ?? HESITATION_TIME_THRESHOLDS_MS.default
}

const subgameLabels = {
  speedrun_characters: 'Speedrun',
  face_morph: 'Face morph',
  emoji_guess: 'Emoji',
  puzzle: 'Puzzle',
  got_matching: 'Game of Thrones',
  dark_matching: 'Dark',
  aib_matching: 'Alice in Borderland',
  st_matching: 'Stranger Things',
  love_matching: 'Love matching',
  citazioni: 'Citazioni',
  colonna_sonora: 'Colonne sonore',
  intruder: 'Intrusi',
  domande_aperte: 'Domande aperte',
}

function getChallengeSubgameId(challenge) {
  return challenge?.quizSubType || challenge?.type || ''
}

function getCategoryChallengeSubgameId(category, challenge) {
  return resolveWeightedScoreGroupConfig(category, challenge)?.id ?? getChallengeSubgameId(challenge)
}

function getChallengeSubgameKey(category, challenge) {
  if (!challenge?.zoneId) {
    return ''
  }

  return `${challenge.zoneId}::${getCategoryChallengeSubgameId(category, challenge)}`
}

function getChallengeSubgameLabel(category, challenge) {
  const weightedGroup = resolveWeightedScoreGroupConfig(category, challenge)
  if (weightedGroup?.label) {
    return weightedGroup.label
  }

  const subgameId = getCategoryChallengeSubgameId(category, challenge)

  return subgameLabels[subgameId] ?? challenge?.title ?? challengeTypeLabels[challenge?.type] ?? 'Sottogioco'
}

function DailyLimitOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.75rem] bg-slate-950/85 backdrop-blur-sm">
      <div className="mx-4 max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/80">
          Limite raggiunto
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Sessione bloccata per oggi
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Non hai piu tentativi o vite disponibili per proseguire oggi. Riprova domani.
        </p>
      </div>
    </div>
  )
}

const ERROR_OPACITIES = [0.38, 0.52, 0.66]

function ZoneChallengeNavigator({
  currentChallengeId,
  challenges,
  onSelect,
  resolvedChallengeIds,
  label = 'Prove della zona',
  vertical = false,
}) {
  if (challenges.length <= 1) {
    return null
  }

  return (
    <div className={[
      vertical
        ? 'flex flex-col items-stretch gap-2'
        : 'mb-4 flex flex-wrap items-center gap-2',
    ].join(' ')}>
      <span className={[
        'text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-300/75',
        vertical ? 'mb-1 text-center' : 'mr-2',
      ].join(' ')}>
        {label}
      </span>
      {challenges.map((challenge, index) => {
        const isActive = challenge.id === currentChallengeId
        const isResolved = resolvedChallengeIds.includes(challenge.id)

        return (
          <button
            key={challenge.id}
            aria-pressed={isActive}
            className={[
              'inline-flex min-w-10 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              vertical ? 'w-full min-h-10 px-0' : '',
              isActive
                ? 'border-amber-200/70 bg-amber-300/18 text-amber-50'
                : isResolved
                  ? 'border-rose-300/35 bg-rose-400/10 text-rose-100 hover:border-rose-200/55'
                  : 'border-white/12 bg-white/5 text-slate-100 hover:border-cyan-300/45 hover:text-cyan-100',
            ].join(' ')}
            onClick={() => onSelect(challenge.id)}
            title={challenge.title}
            type="button"
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}

function SubgameNavigator({ currentSubgameId, lockedSubgameIds = [], onSelect, resolvedChallengeIds, subgames }) {
  if (subgames.length <= 1) {
    return null
  }

  return (
    <div className="space-y-2 rounded-[1.4rem] border border-slate-800 bg-slate-900/60 px-4 py-4">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-300/75">
        Sottogiochi della zona
      </p>
      <div className="flex flex-wrap gap-2">
        {subgames.map((subgame) => {
          const isActive = subgame.id === currentSubgameId
          const isLocked = lockedSubgameIds.includes(subgame.id) && !isActive
          const completedCount = subgame.challengeIds.filter((challengeId) => resolvedChallengeIds.includes(challengeId)).length

          return (
            <button
              key={subgame.id}
              aria-pressed={isActive}
              disabled={isLocked}
              className={[
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-45',
                isActive
                  ? 'border-amber-200/70 bg-amber-300/18 text-amber-50'
                  : 'border-white/12 bg-white/5 text-slate-100 hover:border-cyan-300/45 hover:text-cyan-100',
              ].join(' ')}
              onClick={() => onSelect(subgame.id)}
              type="button"
            >
              <span>{subgame.label}</span>
              <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] tracking-[0.14em] text-slate-300/85">
                {completedCount}/{subgame.challengeIds.length}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PlayCategorySession({ category, preferredChallengeId }) {
  const navigate = useNavigate()
  const [infoModalChallengeId, setInfoModalChallengeId] = useState('')
  const [isRoomMapVisible, setIsRoomMapVisible] = useState(false)
  const [hintModalChallengeId, setHintModalChallengeId] = useState('')
  const audioPlayCountRef = useRef(0)
  const challengeMediaRef = useRef(null)
  const hesitationFiredRef = useRef(false)
  const clearCountRef = useRef(0)
  const prevTextAnswerRef = useRef('')
  const hesitationTimerRef = useRef(null)
  const {
    accessCode,
    clearActiveSession,
    applyChallengeFeedbackOutcome,
    isMusicEnabled,
    playerState,
    registerRoomOutcome,
    spendCredits,
    registerQuizAttempt,
    markRoomIntroSeen,
    markVictoryModalSeen,
    canAttemptQuiz,
    getCredits,
    isRoomIntroPending,
    queuePendingBridge,
    syncActiveSessionSnapshot,
  } = usePlayerState()
  const { activePanel, resultComment, showComment, dismissPanel, clearResultComment } = useCharacterComments(
    category.characterComments,
    category.characters,
  )
  const { isFearActive, stopWrongAnswerEffect, triggerWrongAnswerEffect } = useFearEffects(category, isMusicEnabled)
  const persistedSession = playerState.activeSession?.categoryId === category.id
    ? playerState.activeSession
    : null
  const roomProgress = playerState.roomProgress[category.id] ?? null
  const archivedSession = !persistedSession && roomProgress?.lastCompletedSession
    ? {
        ...roomProgress.lastCompletedSession,
        categoryId: category.id,
        sessionCorrectCount: roomProgress.lastCompletedSession.correctCount ?? 0,
        sessionWrongCount: roomProgress.lastCompletedSession.wrongCount ?? 0,
        currentChallengeId:
          preferredChallengeId ||
          roomProgress.lastCompletedSession.currentChallengeId ||
          category.challenges[0]?.id ||
          '',
      }
    : null
  const {
    challengeStatesByChallengeId,
    challengeResults,
    challengeNumber,
    currentChallengeId,
    challengeState,
    currentChallenge,
    dismissFeedback,
    draftAnswer,
    draftAnswersByChallengeId,
    feedback,
    feedbackMode,
    goToNextChallenge,
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
    restartSession,
    submitChallenge,
    totalChallenges,
    updateChallengeState,
    updateDraftAnswer,
  } = useChallengeSession(category, preferredChallengeId, persistedSession ?? archivedSession)
  const hasPersistedOutcomeRef = useRef(false)
  const isPersistingOutcomeRef = useRef(false)
  const hasTriggeredPrizeEmailsRef = useRef(false)
  const immediateUnlockTargets = useMemo(
    () => roomUnlockTargets[category.id] ?? [],
    [category.id],
  )
  const roomTransition = getRoomTransition(category.id)
  const isMusicRoom = category.id === 'musica'
  const isImmersiveRoom = Boolean(category.mapHotspots?.length)
  const hasWeightedScoring = Boolean(category.weightedScoring)
  const currentRoomProgress = roomProgress
  const archivedRoomReadOnly = Boolean(archivedSession)
  const pendingBridge = playerState.transitionState?.pendingBridge ?? null
  const victoryModalAlreadySeen = currentRoomProgress?.victoryModalSeen ?? false
  const weightedResult = useMemo(() => {
    if (!hasWeightedScoring) return null
    const feedbackMap = new Map(Object.entries(challengeResults))
    return computeWeightedRoomScore(category, feedbackMap)
  }, [category, challengeResults, hasWeightedScoring])
  const roomOutcomeSummary = useMemo(() => {
    if (!weightedResult) {
      return null
    }

    return {
      weightedScore: weightedResult.weightedScore,
      passedByScore: weightedResult.isPassing,
      subPrizesWon: weightedResult.subPrizesWon,
      typeResults: weightedResult.typeResults,
      groupResults: weightedResult.groupResults,
    }
  }, [weightedResult])
  const earlyMusicVictory = isMusicRoom && sessionCorrectCount >= 8 && !isComplete && !victoryModalAlreadySeen
  const passedRoom = hasWeightedScoring
    ? (weightedResult?.isPassing ?? false)
    : sessionCorrectCount >= 8
  const shouldShowRoomVictoryModal =
    earlyMusicVictory ||
    (isComplete && passedRoom && !victoryModalAlreadySeen)
  const roomTransitionTargetUnlocked = roomTransition
    ? playerState.unlockedCategoryIds.includes(roomTransition.targetCategoryId)
    : false
  const shouldTriggerBridgeTransition =
    isComplete &&
    Boolean(roomTransition) &&
    !roomTransitionTargetUnlocked &&
    !shouldShowRoomVictoryModal &&
    (!pendingBridge ||
      (pendingBridge.sourceCategoryId === category.id && !pendingBridge.bridgeCompletedAt))
  const currentZoneId = currentChallenge?.zoneId ?? ''
  const currentSubgameId = getCategoryChallengeSubgameId(category, currentChallenge)
  const currentSubgameKey = getChallengeSubgameKey(category, currentChallenge)
  const zoneChallengeMap = useMemo(
    () =>
      category.challenges.reduce((accumulator, challenge) => {
        if (!challenge.zoneId) {
          return accumulator
        }

        if (!accumulator[challenge.zoneId]) {
          accumulator[challenge.zoneId] = []
        }

        accumulator[challenge.zoneId].push(challenge.id)
        return accumulator
      }, {}),
    [category.challenges],
  )
  const zoneSubgameMap = useMemo(
    () =>
      category.challenges.reduce((accumulator, challenge) => {
        if (!challenge.zoneId) {
          return accumulator
        }

        const zoneId = challenge.zoneId
        const subgameId = getCategoryChallengeSubgameId(category, challenge)

        if (!accumulator[zoneId]) {
          accumulator[zoneId] = []
        }

        let existingSubgame = accumulator[zoneId].find((subgame) => subgame.id === subgameId)

        if (!existingSubgame) {
          existingSubgame = {
            id: subgameId,
            label: getChallengeSubgameLabel(category, challenge),
            fallbackPrompt: challenge.prompt || challenge.infoText || 'La prova ti aspetta.',
            introText: challenge.subgameIntroText || '',
            challengeIds: [],
          }
          accumulator[zoneId].push(existingSubgame)
        }

        if (!existingSubgame.introText && challenge.subgameIntroText) {
          existingSubgame.introText = challenge.subgameIntroText
        }

        existingSubgame.challengeIds.push(challenge.id)
        return accumulator
      }, {}),
    [category, category.challenges],
  )
  const currentZoneChallenges = useMemo(
    () => (zoneChallengeMap[currentZoneId] ?? [])
      .map((challengeId) => category.challenges.find((challenge) => challenge.id === challengeId) ?? null)
      .filter(Boolean),
    [category.challenges, currentZoneId, zoneChallengeMap],
  )
  const currentZoneSubgames = useMemo(
    () => zoneSubgameMap[currentZoneId] ?? [],
    [currentZoneId, zoneSubgameMap],
  )
  const currentSubgameChallenges = useMemo(
    () => currentZoneChallenges.filter((challenge) => getCategoryChallengeSubgameId(category, challenge) === currentSubgameId),
    [category, currentSubgameId, currentZoneChallenges],
  )
  const currentSubgame = useMemo(
    () => currentZoneSubgames.find((subgame) => subgame.id === currentSubgameId) ?? null,
    [currentSubgameId, currentZoneSubgames],
  )
  const currentZoneHotspot = useMemo(
    () => category.mapHotspots?.find((hotspot) => hotspot.id === currentZoneId) ?? null,
    [category.mapHotspots, currentZoneId],
  )
  const [pendingIntroSubgameKey, setPendingIntroSubgameKey] = useState(
    () => (persistedSession ? '' : getChallengeSubgameKey(category, currentChallenge)),
  )
  const currentSubgameResolvedCount = currentSubgameChallenges.filter(
    (challenge) => resolvedChallengeIds.includes(challenge.id),
  ).length
  const isCurrentSubgameStarted = currentSubgameResolvedCount > 0
  const isCurrentSubgameComplete =
    currentSubgameChallenges.length > 0 && currentSubgameResolvedCount === currentSubgameChallenges.length
  const canContinueCurrentSubgame = hasWeightedScoring && isCurrentSubgameStarted && !isCurrentSubgameComplete
  const newSubgamesLocked = !canAttemptQuiz() && !isComplete

  useEffect(() => {
    if (!shouldTriggerBridgeTransition || !roomTransition) {
      return
    }

    queuePendingBridge({
      sourceCategoryId: category.id,
      targetCategoryId: roomTransition.targetCategoryId,
    })

    navigate('/bridge', { replace: true })
  }, [category.id, navigate, queuePendingBridge, roomTransition, shouldTriggerBridgeTransition])

  useEffect(() => {
    const shouldPersist = isComplete || earlyMusicVictory
    if (!shouldPersist || hasPersistedOutcomeRef.current || isPersistingOutcomeRef.current) {
      return
    }

    let isCancelled = false
    isPersistingOutcomeRef.current = true

    async function persistOutcomeAndSendPrizeEmails() {
      const result = await registerRoomOutcome({
        categoryId: category.id,
        challengeResults,
        challengeStatesByChallengeId,
        correctCount: sessionCorrectCount,
        draftAnswersByChallengeId,
        wrongCount: sessionWrongCount,
        totalChallenges,
        passedOverride: passedRoom,
        outcomeSummary: roomOutcomeSummary,
        unlockedCategoryIds: immediateUnlockTargets,
      })

      if (result?.ok === false) {
        isPersistingOutcomeRef.current = false
        return
      }

      if (isCancelled) {
        isPersistingOutcomeRef.current = false
        hasPersistedOutcomeRef.current = true
        return
      }

      hasPersistedOutcomeRef.current = true
      isPersistingOutcomeRef.current = false

      if (
        category.id === 'musica' &&
        sessionCorrectCount >= 8 &&
        !hasTriggeredPrizeEmailsRef.current
      ) {
        hasTriggeredPrizeEmailsRef.current = true
        void sendMusicPrizeMail1(accessCode).catch(() => {})
        void sendMusicPrizeMail2(accessCode).catch(() => {})
      }

      if (
        category.id === 'serie-film' &&
        isComplete &&
        passedRoom &&
        !hasTriggeredPrizeEmailsRef.current
      ) {
        hasTriggeredPrizeEmailsRef.current = true
        void sendSerieFilmArtifactMail(accessCode).catch(() => {})
        void sendSerieFilmPrizeMail(accessCode).catch(() => {})
      }
    }

    void persistOutcomeAndSendPrizeEmails()

    return () => {
      isCancelled = true
    }
  }, [
    accessCode,
    category.id,
    challengeResults,
    challengeStatesByChallengeId,
    draftAnswersByChallengeId,
    earlyMusicVictory,
    immediateUnlockTargets,
    isComplete,
    passedRoom,
    registerRoomOutcome,
    roomOutcomeSummary,
    sessionCorrectCount,
    sessionWrongCount,
    totalChallenges,
  ])

  function handleSubmit(event) {
    event.preventDefault()
    if (archivedRoomReadOnly) {
      return
    }
    if (challengeMediaRef.current) {
      const mediaElements = challengeMediaRef.current.querySelectorAll('audio, video')
      mediaElements.forEach((mediaElement) => {
        mediaElement.pause()
        mediaElement.currentTime = 0
      })
    }

    const nextFeedback = submitChallenge()

    if (!nextFeedback) {
      return
    }

    const feedbackChallenge =
      category.challenges.find((challenge) => challenge.id === nextFeedback.attemptedChallengeId) ?? currentChallenge
    const nextChallengeResults = {
      ...challengeResults,
      [nextFeedback.attemptedChallengeId]: nextFeedback,
    }
    const feedbackSubgameId = getCategoryChallengeSubgameId(category, feedbackChallenge)
    const feedbackSubgameChallenges = category.challenges.filter(
      (challenge) => getCategoryChallengeSubgameId(category, challenge) === feedbackSubgameId,
    )
    const isFirstAttemptInSubgame = feedbackSubgameChallenges.every(
      (challenge) => !challengeResults[challenge.id],
    )
    const isSubgameResolved = feedbackSubgameChallenges.every(
      (challenge) => Boolean(nextChallengeResults[challenge.id]),
    )
    const awardedCredits = resolveChallengeCreditReward(feedbackChallenge, nextFeedback)
    let consumeLife = !nextFeedback.isCorrect

    if (hasWeightedScoring) {
      if (isFirstAttemptInSubgame) {
        registerQuizAttempt()
      }

      consumeLife = false

      if (isSubgameResolved) {
        const nextWeightedResult = computeWeightedRoomScore(
          category,
          new Map(Object.entries(nextChallengeResults)),
        )
        consumeLife = nextWeightedResult.groupResults[feedbackSubgameId]?.isPassing === false
      }
    } else {
      registerQuizAttempt()
    }

    applyChallengeFeedbackOutcome({
      awardedCredits,
      consumeLife,
    })

    if (nextFeedback.isCorrect) {
      showComment('onCorrect')
    } else {
      triggerWrongAnswerEffect()
      showComment('onWrong')
    }
  }

  // Scope key: resets per track/stage for hitster/musical_chain, per question otherwise.
  const hesitationScopeKey = useMemo(() => {
    const type = currentChallenge?.type
    if (type === 'hitster') {
      return `${currentChallengeId ?? ''}-t${challengeState.hitsterRevealedTrackCount ?? 0}`
    }
    if (type === 'musical_chain') {
      return `${currentChallengeId ?? ''}-s${challengeState.musicalChainStageIndex ?? 0}`
    }
    return currentChallengeId ?? ''
  }, [
    currentChallengeId,
    currentChallenge?.type,
    challengeState.hitsterRevealedTrackCount,
    challengeState.musicalChainStageIndex,
  ])

  // Reset all hesitation counters when scope changes (new question / new track / new stage).
  useEffect(() => {
    audioPlayCountRef.current = 0
    hesitationFiredRef.current = false
    clearCountRef.current = 0
    prevTextAnswerRef.current = ''
  }, [hesitationScopeKey])

  const handleAudioPlay = useCallback(() => {
    audioPlayCountRef.current += 1
    if (audioPlayCountRef.current >= HESITATION_AUDIO_PLAY_THRESHOLD && !hesitationFiredRef.current) {
      hesitationFiredRef.current = true
      showComment('onHesitation')
    }
  }, [showComment])

  // Trigger hesitation when user blanks the answer field HESITATION_CLEAR_THRESHOLD times.
  useEffect(() => {
    const currentText = draftAnswer?.textAnswer ?? ''
    if (prevTextAnswerRef.current.trim() !== '' && currentText.trim() === '') {
      clearCountRef.current += 1
      if (clearCountRef.current >= HESITATION_CLEAR_THRESHOLD && !hesitationFiredRef.current) {
        hesitationFiredRef.current = true
        showComment('onHesitation')
      }
    }
    prevTextAnswerRef.current = currentText
  }, [draftAnswer?.textAnswer, showComment])

  function handleHintReveal() {
    const cost = currentChallenge?.hintCost ?? 15
    if (!isHintVisible && !spendCredits(cost)) return

    revealHint()

    if (!isHintVisible) {
      showComment('onHintUsed')
    }
  }

  function openHintModal() {
    setInfoModalChallengeId('')
    setHintModalChallengeId(currentChallengeId)
  }

  function openInfoModal() {
    setHintModalChallengeId('')
    setInfoModalChallengeId(currentChallengeId)
  }

  function handleRestart() {
    hasPersistedOutcomeRef.current = false
    isPersistingOutcomeRef.current = false
    hasTriggeredPrizeEmailsRef.current = false
    restartSession()
  }

  const shouldShowRoomIntro = isImmersiveRoom && isRoomIntroPending(category.id)

  useEffect(() => {
    if (isComplete && !archivedRoomReadOnly) {
      clearActiveSession()
      return
    }

    if (!currentChallenge || shouldShowRoomIntro || archivedRoomReadOnly) {
      return
    }

    syncActiveSessionSnapshot(
      {
        categoryId: category.id,
        currentChallengeId,
        challengeResults,
        challengeStatesByChallengeId,
        draftAnswer,
        draftAnswersByChallengeId,
        challengeState,
        isHintVisible,
        resolvedChallengeIds,
        sessionCorrectCount,
        sessionWrongCount,
      },
      { debounced: true },
    )
  }, [
    category.id,
    challengeResults,
    challengeStatesByChallengeId,
    challengeState,
    clearActiveSession,
    currentChallenge,
    currentChallengeId,
    draftAnswer,
    draftAnswersByChallengeId,
    isComplete,
    isHintVisible,
    resolvedChallengeIds,
    sessionCorrectCount,
    sessionWrongCount,
    shouldShowRoomIntro,
    syncActiveSessionSnapshot,
    archivedRoomReadOnly,
  ])

  const challengeMapLocked = newSubgamesLocked && !canContinueCurrentSubgame
  const currentChallengeLocked =
    challengeMapLocked &&
    !hasFeedback &&
    !isCurrentChallengeResolved

  const isChallengeIntroVisible =
    isImmersiveRoom &&
    pendingIntroSubgameKey === currentSubgameKey &&
    Boolean(currentZoneId) &&
    Boolean(currentSubgameId) &&
    !challengeMapLocked &&
    !archivedRoomReadOnly
  const shouldPauseHesitationTimer =
    isImmersiveRoom &&
    isChallengeIntroVisible &&
    !isCurrentChallengeResolved &&
    (canAttemptQuiz() || canContinueCurrentSubgame) &&
    !isComplete
  const currentZoneIntroText =
    currentSubgame?.introText ||
    (currentSubgame?.challengeIds.length === 1 ? currentSubgame?.fallbackPrompt : '') ||
    currentZoneHotspot?.introPrompt ||
    currentZoneHotspot?.description ||
    currentChallenge?.prompt ||
    'La prova ti aspetta.'

  // Trigger hesitation after a time threshold if the user hasn't answered yet.
  useEffect(() => {
    const isSpeedrunChallenge = currentChallenge?.type === 'speedrun_characters'

    if (!currentChallenge || hasFeedback || isComplete || shouldPauseHesitationTimer || isSpeedrunChallenge) {
      if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current)
      return
    }
    const delay = resolveHesitationDelayMs(currentChallenge)
    const id = setTimeout(() => {
      if (!hesitationFiredRef.current) {
        hesitationFiredRef.current = true
        showComment('onHesitation')
      }
    }, delay)
    hesitationTimerRef.current = id
    return () => clearTimeout(id)
  }, [hesitationScopeKey, hasFeedback, isComplete, currentChallenge, shouldPauseHesitationTimer, showComment])

  const ambientAudioSrc = category.ambientAudioSrc || '/audio/bg_music_room.mp3'
  const shouldPlayAmbientAudio =
    isImmersiveRoom &&
    isMusicEnabled &&
    (isChallengeIntroVisible || isRoomMapVisible) &&
    !hasFeedback
  const shouldPlayRoundMusic =
    isImmersiveRoom &&
    isMusicEnabled &&
    Boolean(currentChallenge?.roundMusicSrc) &&
    !shouldShowRoomIntro &&
    !isChallengeIntroVisible &&
    !isRoomMapVisible &&
    !hasFeedback &&
    !isComplete &&
    !isCurrentChallengeResolved &&
    !currentChallengeLocked &&
    !archivedRoomReadOnly

  useBackgroundAudio({ src: ambientAudioSrc, volume: 0.15 }, shouldPlayAmbientAudio)
  useBackgroundAudio({ src: currentChallenge?.roundMusicSrc, volume: 0.18 }, shouldPlayRoundMusic)

  // Immersive room intro narrative gate (shown once)
  if (shouldShowRoomIntro) {
    return (
      <MusicRoomNarrative
        category={category}
        onComplete={() => markRoomIntroSeen(category.id)}
      />
    )
  }

  // Show special victory modal when passing threshold reached
  if (shouldShowRoomVictoryModal) {
    if (category.id === 'serie-film') {
      return (
        <SeriesFilmVictoryModal
          category={category}
          onClose={() => markVictoryModalSeen(category.id)}
          sessionCorrectCount={sessionCorrectCount}
          sessionWrongCount={sessionWrongCount}
          totalChallenges={totalChallenges}
          wonSubPrizeIds={weightedResult?.subPrizesWon ?? []}
        />
      )
    }

    return (
      <MusicRoomVictoryModal
        category={category}
        sessionCorrectCount={sessionCorrectCount}
        sessionWrongCount={sessionWrongCount}
        totalChallenges={totalChallenges}
        onClose={() => markVictoryModalSeen(category.id)}
      />
    )
  }

  if (isComplete && !archivedRoomReadOnly) {
    if (shouldTriggerBridgeTransition) {
      return (
        <section className="space-y-6 rounded-[2rem] border border-amber-300/20 bg-slate-950/75 p-8 shadow-[0_0_90px_rgba(8,145,178,0.08)] backdrop-blur-xl sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/80">
              Passaggio in preparazione
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Le voci della mostra stanno richiamando il prossimo varco.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              La sala ha concluso tutto cio che doveva offrirti. Ora il passaggio prosegue nella Grotta delle Ombre.
            </p>
          </div>
        </section>
      )
    }

    return (
      <ChallengeCompleted
        category={category}
        onRestart={handleRestart}
        passedRoom={passedRoom}
        sessionCorrectCount={sessionCorrectCount}
        sessionWrongCount={sessionWrongCount}
        unlockedCategoryIds={passedRoom ? immediateUnlockTargets : []}
        totalChallenges={totalChallenges}
      />
    )
  }

  if (!currentChallenge) {
    return (
      <section className="rounded-[2rem] border border-slate-800 bg-slate-950/60 p-8 shadow-[0_0_80px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
          Archivio vuoto
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Nessuna prova disponibile
        </h2>
      </section>
    )
  }

  const controlsDisabled =
    isSubmitting ||
    hasFeedback ||
    isCurrentChallengeResolved ||
    currentChallengeLocked ||
    archivedRoomReadOnly
  const credits = getCredits()
  const attemptsRemaining = getAttemptsRemaining(playerState)
  const livesRemaining = getLivesRemaining(playerState)
  const activeZoneIds = Object.keys(zoneChallengeMap)
  const feedbackChallenge =
    category.challenges.find((challenge) => challenge.id === feedback.attemptedChallengeId) ?? currentChallenge
  const feedbackCreditReward = resolveChallengeCreditBaseReward(feedbackChallenge)
  const awardedCredits = hasFeedback
    ? resolveChallengeCreditReward(feedbackChallenge, feedback)
    : 0
  const errorImageSources = category.wrongAnswerImageSrcs ?? []
  const errorVisualIndex = sessionWrongCount > 0 && errorImageSources.length > 0
    ? (sessionWrongCount - 1) % errorImageSources.length
    : 0
  const roomInteractionsDisabled = isSubmitting || hasFeedback || challengeMapLocked
  const hasInfo = Boolean(currentChallenge.infoText || currentChallenge.prompt)
  const infoDisabled = roomInteractionsDisabled || !hasInfo
  const infoDisabledReason = !hasInfo
    ? 'Nessuna informazione disponibile per questa prova.'
    : archivedRoomReadOnly
      ? 'Sala completata: consultazione soltanto.'
    : newSubgamesLocked && !canContinueCurrentSubgame
      ? 'Hai finito i tentativi disponibili per nuovi sottogiochi oggi.'
      : ''
  const hasHint = Boolean(currentChallenge.hint)
  const canAffordHint = credits >= (currentChallenge.hintCost ?? 0)
  const hintDisabled =
    roomInteractionsDisabled ||
    archivedRoomReadOnly ||
    !hasHint ||
    (!isHintVisible && !canAffordHint)
  const hintDisabledReason = !hasHint
    ? 'Nessun indizio disponibile per questa prova.'
    : archivedRoomReadOnly
      ? 'Sala completata: gli indizi non sono più acquistabili.'
    : newSubgamesLocked && !canContinueCurrentSubgame
      ? 'Hai finito i tentativi disponibili per nuovi sottogiochi oggi.'
      : !isHintVisible && !canAffordHint
          ? 'Crediti insufficienti per usare l\'indizio.'
          : ''
  const mapDisabled = isSubmitting || hasFeedback || newSubgamesLocked
  const mapDisabledReason = newSubgamesLocked
    ? 'Puoi concludere il sottogioco in corso, ma non iniziarne altri oggi.'
    : ''
  const challengeInfoText = currentChallenge.infoText || currentChallenge.prompt || ''
  const canPurchaseHint =
    !roomInteractionsDisabled &&
    hasHint &&
    !isHintVisible &&
    canAffordHint
  const isHintModalOpen = hintModalChallengeId === currentChallengeId && !hasFeedback
  const isInfoModalOpen = infoModalChallengeId === currentChallengeId && !hasFeedback
  const isRoomMapOpen = isRoomMapVisible && !hasFeedback
  const limitBanner = newSubgamesLocked ? (
    <div className="rounded-[1.4rem] border border-amber-300/25 bg-amber-300/10 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/80">
        Limite raggiunto
      </p>
      <p className="mt-2 text-sm leading-6 text-amber-50/90">
        {canContinueCurrentSubgame
          ? 'Puoi concludere il sottogioco in corso, ma non iniziarne altri oggi.'
          : 'Non hai piu tentativi o vite disponibili per oggi.'}
      </p>
    </div>
  ) : null
  const archivedBanner = archivedRoomReadOnly ? (
    <div className="rounded-[1.4rem] border border-cyan-300/25 bg-cyan-400/10 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/80">
        Sala completata
      </p>
      <p className="mt-2 text-sm leading-6 text-cyan-50/90">
        Questa stanza è ora in sola consultazione. Puoi visitarla, ma le risposte non sono più modificabili.
      </p>
    </div>
  ) : null

  function handleSelectZone(zoneId) {
    const zoneChallengeIds = zoneChallengeMap[zoneId] ?? []

    if (!zoneChallengeIds.length) {
      return
    }

    const nextChallengeId =
      zoneChallengeIds.find((challengeId) => !resolvedChallengeIds.includes(challengeId)) ??
      zoneChallengeIds[0]
    const nextChallenge =
      category.challenges.find((challenge) => challenge.id === nextChallengeId) ?? null

    if (
      newSubgamesLocked &&
      nextChallenge &&
      getCategoryChallengeSubgameId(category, nextChallenge) !== currentSubgameId
    ) {
      return
    }

    clearResultComment()
    dismissFeedback()
    setInfoModalChallengeId('')
    setHintModalChallengeId('')
    setPendingIntroSubgameKey(getChallengeSubgameKey(category, nextChallenge))
    selectChallenge(nextChallengeId, { openResolvedFeedback: false })
    setIsRoomMapVisible(false)
  }

  function handleSelectSubgame(subgameId) {
    const targetSubgame = currentZoneSubgames.find((subgame) => subgame.id === subgameId)

    if (!targetSubgame) {
      return
    }

    if (newSubgamesLocked && subgameId !== currentSubgameId) {
      return
    }

    const nextChallengeId =
      targetSubgame.challengeIds.find((challengeId) => !resolvedChallengeIds.includes(challengeId)) ??
      targetSubgame.challengeIds[0]
    const nextChallenge =
      category.challenges.find((challenge) => challenge.id === nextChallengeId) ?? null

    clearResultComment()
    dismissFeedback()
    setInfoModalChallengeId('')
    setHintModalChallengeId('')
    if (getCategoryChallengeSubgameId(category, currentChallenge) !== subgameId) {
      setPendingIntroSubgameKey(getChallengeSubgameKey(category, nextChallenge))
    }
    selectChallenge(nextChallengeId, { openResolvedFeedback: false })
  }

  const shouldShowDefaultFloatingPanel =
    activePanel?.eventType === 'onHesitation' || activePanel?.eventType === 'onHintUsed'
  const isHesitationPanelVisible = activePanel?.eventType === 'onHesitation'
  const zoneNavigatorSide = (
    <ZoneChallengeNavigator
      challenges={currentSubgameChallenges}
      currentChallengeId={currentChallengeId}
      label="Prove del sottogioco"
      onSelect={(challengeId) => {
        setHintModalChallengeId('')
        setInfoModalChallengeId('')
        clearResultComment()
        dismissFeedback()
        selectChallenge(challengeId)
      }}
      resolvedChallengeIds={resolvedChallengeIds}
      vertical
    />
  )
  const subgameNavigator = (
    <SubgameNavigator
      currentSubgameId={currentSubgameId}
      lockedSubgameIds={
        newSubgamesLocked
          ? currentZoneSubgames
            .map((subgame) => subgame.id)
            .filter((subgameId) => subgameId !== currentSubgameId)
          : []
      }
      onSelect={handleSelectSubgame}
      resolvedChallengeIds={resolvedChallengeIds}
      subgames={currentZoneSubgames}
    />
  )

  return (
    <>
      {isImmersiveRoom ? (
        <>
          <RoomPlayLayout
            attemptsRemaining={attemptsRemaining}
            banner={limitBanner || archivedBanner ? <div className="space-y-3">{limitBanner}{archivedBanner}</div> : null}
            category={category}
            credits={credits}
            infoDisabled={infoDisabled}
            infoDisabledReason={infoDisabledReason}
            hintDisabled={hintDisabled}
            hintDisabledReason={hintDisabledReason}
            isFearActive={isFearActive}
            livesRemaining={livesRemaining}
            mapDisabled={mapDisabled}
            mapDisabledReason={mapDisabledReason}
            onHintClick={openHintModal}
            onInfoClick={openInfoModal}
            onMapClick={() => setIsRoomMapVisible(true)}
            progressLabel={progressLabel}
            sessionCorrectCount={sessionCorrectCount}
            sessionWrongCount={sessionWrongCount}
          >
            {isChallengeIntroVisible ? (
              <div className="space-y-4">
                <MusicChallengeIntro
                  key={currentSubgameKey}
                  character={getRoomCharacterBySpeaker(category.characters, 'guardian')}
                  introText={currentZoneIntroText}
                  onComplete={() => {
                    setPendingIntroSubgameKey('')

                    if (isCurrentChallengeResolved) {
                      selectChallenge(currentChallengeId)
                    }
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {currentChallengeLocked ? <DailyLimitOverlay /> : null}

                {subgameNavigator}

                {/* Achille brief panel for onHintUsed (above quiz card) */}
                {activePanel?.eventType === 'onHintUsed' ? (
                  <CharacterPanel
                    autoDismissMs={0}
                    character={activePanel.character}
                    message={activePanel.text}
                    mirror={false}
                    onDismiss={dismissPanel}
                    visible={!!activePanel}
                  />
                ) : null}

                {/* Quiz card + optional Sal hesitation side panel */}
                <div className={[
                  'relative',
                  isHesitationPanelVisible ? 'lg:pb-36' : '',
                ].join(' ')}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    <div
                      className="w-full lg:min-w-0 lg:flex-1"
                      ref={challengeMediaRef}
                    >
                      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-4 py-5 shadow-[0_0_60px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:px-5 sm:py-6">
                        <div className="mb-4">
                          <span className="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-100">
                            {challengeTypeLabels[currentChallenge.type] ?? currentChallenge.type}
                          </span>
                        </div>
                        <ChallengeRenderer
                          challenge={currentChallenge}
                          challengeState={challengeState}
                          credits={credits}
                          disabled={controlsDisabled}
                          draftAnswer={draftAnswer}
                          onAudioPlay={handleAudioPlay}
                          onBuyTime={(seconds, cost) => spendCredits(cost)}
                          onChallengeStateChange={updateChallengeState}
                          onDraftAnswerChange={updateDraftAnswer}
                          onSubmit={handleSubmit}
                          showHeader={false}
                        />
                      </div>
                    </div>

                    {currentSubgameChallenges.length > 1 ? (
                      <div className="w-full lg:w-24 lg:shrink-0">
                        {zoneNavigatorSide}
                      </div>
                    ) : null}
                  </div>

                  {isHesitationPanelVisible ? (
                    <>
                      <div className="mt-4 lg:hidden">
                        <CharacterPanel
                          autoDismissMs={0}
                          character={activePanel.character}
                          message={activePanel.text}
                          mirror
                          onDismiss={dismissPanel}
                          visible={!!activePanel}
                        />
                      </div>

                      <div className="pointer-events-none absolute bottom-0 left-0 hidden w-72 lg:block">
                        <div className="pointer-events-auto">
                          <CharacterPanel
                            autoDismissMs={0}
                            character={activePanel.character}
                            message={activePanel.text}
                            mirror
                            onDismiss={dismissPanel}
                            visible={!!activePanel}
                          />
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </RoomPlayLayout>

          <RoomMapModal
            activeZoneIds={activeZoneIds}
            category={category}
            currentChallengeId={currentChallengeId}
            currentZoneId={currentZoneId}
            interactionDisabled={mapDisabled}
            isOpen={isRoomMapOpen}
            onClose={() => setIsRoomMapVisible(false)}
            onSelectZone={handleSelectZone}
            resolvedChallengeIds={resolvedChallengeIds}
          />

          <ResultModal
            awardedCredits={awardedCredits}
            characterComment={feedbackMode === 'fresh' ? resultComment : null}
            creditReward={feedbackCreditReward}
            errorImageSrc={
              errorImageSources.length > 0 && hasFeedback && !feedback.isCorrect
                ? (errorImageSources[errorVisualIndex] ?? null)
                : null
            }
            errorOpacity={
              errorImageSources.length > 0 && hasFeedback && !feedback.isCorrect
                ? (ERROR_OPACITIES[errorVisualIndex % ERROR_OPACITIES.length] ?? 0.38)
                : 0
            }
            feedback={hasFeedback ? feedback : null}
            isOpen={hasFeedback}
            mode={feedbackMode}
            onClose={() => {
              stopWrongAnswerEffect()
              setIsRoomMapVisible(false)
              setHintModalChallengeId('')
              setInfoModalChallengeId('')
              clearResultComment()
              dismissFeedback()
            }}
            onContinue={() => {
              stopWrongAnswerEffect()
              setIsRoomMapVisible(false)
              setHintModalChallengeId('')
              setInfoModalChallengeId('')
              clearResultComment()
              const nextChallenge = goToNextChallenge()

              if (nextChallenge && getChallengeSubgameKey(category, nextChallenge) !== currentSubgameKey) {
                setPendingIntroSubgameKey(getChallengeSubgameKey(category, nextChallenge))
              }
            }}
          />
        </>
      ) : (
        <ChallengeLayout
          category={category}
          credits={credits}
          attemptsRemaining={attemptsRemaining}
          livesRemaining={livesRemaining}
          progressLabel={progressLabel}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/18"
                onClick={() => setIsRoomMapVisible((visible) => !visible)}
                type="button"
              >
                {isRoomMapOpen ? 'Nascondi mappa quiz' : 'Mostra mappa quiz'}
              </button>
            </div>

            {isRoomMapOpen ? (
              <div>
                <ChallengeSelectorGrid
                  category={category}
                  currentChallengeId={currentChallengeId}
                  interactionDisabled={challengeMapLocked}
                  onSelect={selectChallenge}
                  resolvedChallengeIds={resolvedChallengeIds}
                />
              </div>
            ) : null}

            {archivedBanner}

            <ChallengeProgress
              challengeNumber={challengeNumber}
              completedChallenges={resolvedChallengeCount}
              sessionCorrectCount={sessionCorrectCount}
              sessionWrongCount={sessionWrongCount}
              totalChallenges={totalChallenges}
              title={currentChallenge.title}
              type={currentChallenge.type}
            />

            <div className="relative space-y-4 rounded-[1.75rem] border border-slate-800 bg-slate-950/55 p-5 sm:p-6" ref={challengeMediaRef}>
              {currentChallengeLocked ? <DailyLimitOverlay /> : null}
              <ChallengeRenderer
                challenge={currentChallenge}
                challengeState={challengeState}
                credits={credits}
                disabled={controlsDisabled}
                draftAnswer={draftAnswer}
                onAudioPlay={handleAudioPlay}
                onBuyTime={(seconds, cost) => spendCredits(cost)}
                onChallengeStateChange={updateChallengeState}
                onDraftAnswerChange={updateDraftAnswer}
                onSubmit={handleSubmit}
              />

              <ChallengeHintPanel
                hint={currentChallenge.hint}
                hintDisabled={hintDisabled}
                hintDisabledReason={hintDisabledReason}
                hintCost={currentChallenge.hintCost}
                infoDisabled={infoDisabled}
                infoDisabledReason={infoDisabledReason}
                isVisible={isHintVisible}
                onHintClick={openHintModal}
                onInfoClick={openInfoModal}
              />

              {hasFeedback ? (
                <ChallengeFeedback
                  awardedCredits={awardedCredits}
                  creditReward={resolveChallengeCreditBaseReward(currentChallenge)}
                  feedback={feedback}
                  onContinue={goToNextChallenge}
                />
              ) : null}

              {shouldShowDefaultFloatingPanel ? (
                <CharacterPanel
                  autoDismissMs={0}
                  character={activePanel.character}
                  message={activePanel.text}
                  mirror={activePanel.eventType === 'onHesitation'}
                  onDismiss={dismissPanel}
                  visible={!!activePanel}
                />
              ) : null}
            </div>
          </div>
        </ChallengeLayout>
      )}

      <ChallengeInfoModal
        description={challengeInfoText}
        isOpen={isInfoModalOpen}
        onClose={() => setInfoModalChallengeId('')}
        title={currentChallenge.title || 'Dettagli prova'}
      />

      <HintModal
        canPurchaseHint={canPurchaseHint}
        credits={credits}
        disabledReason={hintDisabledReason}
        hint={currentChallenge.hint}
        hintCost={currentChallenge.hintCost}
        isHintVisible={isHintVisible}
        isOpen={isHintModalOpen}
        onClose={() => setHintModalChallengeId('')}
        onReveal={handleHintReveal}
      />


    </>
  )
}

function PlayPage() {
  const { categoryId } = useParams()
  const [searchParams] = useSearchParams()
  const category = getCategoryById(categoryId)
  const preferredChallengeId = searchParams.get('challenge') ?? ''

  if (!category) {
    return <NotFoundState categoryId={categoryId ?? 'sconosciuta'} />
  }

  return (
    <PlayCategorySession
      key={category.id}
      category={category}
      preferredChallengeId={preferredChallengeId}
    />
  )
}

export default PlayPage