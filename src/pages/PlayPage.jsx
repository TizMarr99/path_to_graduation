import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
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
import ResultModal from '../components/music-room/ResultModal.jsx'
import RoomMapModal from '../components/music-room/RoomMapModal.jsx'
import RoomPlayLayout from '../components/music-room/RoomPlayLayout.jsx'
import { useBackgroundAudio } from '../hooks/useBackgroundAudio'
import { useCharacterComments } from '../hooks/useCharacterComments'
import { useChallengeSession } from '../hooks/useChallengeSession'
import { useFearEffects } from '../hooks/useFearEffects'
import { usePlayerState } from '../hooks/usePlayerState'
import { getCategoryById } from '../lib/challengeData'
import { challengeTypeLabels } from '../lib/challengeRegistry'
import { getAttemptsRemaining, getLivesRemaining } from '../lib/playerStateSnapshot'
import { getRoomCharacterBySpeaker } from '../lib/roomSpeakers'
import {
  resolveChallengeCreditBaseReward,
  resolveChallengeCreditReward,
} from '../lib/challengeRewards'

const roomUnlockTargets = {
  musica: ['ritratto-spezzato', 'archivio-vivente'],
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
  default: 50_000,
}

function DailyLimitOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.75rem] bg-slate-950/85 backdrop-blur-sm">
      <div className="mx-4 max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/80">
          Limite raggiunto
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Tentativi esauriti per questa sessione
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          I tentativi per oggi sono terminati. Riprova domani.
        </p>
      </div>
    </div>
  )
}

const ERROR_IMAGES = [
  '/images/rooms/musica-error1.png',
  '/images/rooms/musica-error2.png',
  '/images/rooms/musica-error4.png',
]
const ERROR_OPACITIES = [0.38, 0.52, 0.66]

function ZoneChallengeNavigator({
  currentChallengeId,
  challenges,
  onSelect,
  resolvedChallengeIds,
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
        Prove della zona
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
                  ? 'border-emerald-300/35 bg-emerald-400/10 text-emerald-100 hover:border-emerald-200/55'
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

function PlayCategorySession({ category, preferredChallengeId }) {
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
    clearActiveSession,
    applyChallengeFeedbackOutcome,
    playerState,
    getRoomProgress,
    registerRoomOutcome,
    unlockCategories,
    spendCredits,
    registerQuizAttempt,
    markMusicRoomIntroSeen,
    canAttemptQuiz,
    getCredits,
    isRoomIntroPending,
    syncActiveSessionSnapshot,
  } = usePlayerState()
  const { activePanel, resultComment, showComment, dismissPanel, clearResultComment } = useCharacterComments(
    category.characterComments,
    category.characters,
  )
  const { isFearActive, stopWrongAnswerEffect, triggerWrongAnswerEffect } = useFearEffects(category)
  const persistedSession = playerState.activeSession?.categoryId === category.id
    ? playerState.activeSession
    : null
  const {
    challengeResults,
    challengeNumber,
    currentChallengeId,
    challengeState,
    currentChallenge,
    dismissFeedback,
    draftAnswer,
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
  } = useChallengeSession(category, preferredChallengeId, persistedSession)
  const hasPersistedOutcomeRef = useRef(false)
  const immediateUnlockTargets = useMemo(
    () => roomUnlockTargets[category.id] ?? [],
    [category.id],
  )
  const roomProgress = getRoomProgress(category.id)
  const hasUnlockedByScore = roomProgress?.unlockedByScore ?? false
  const hasUnlockedTargets = immediateUnlockTargets.every((categoryId) =>
    playerState.unlockedCategoryIds.includes(categoryId),
  )
  const isMusicRoom = category.id === 'musica'
  const currentZoneId = currentChallenge?.zoneId ?? ''
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
  const currentZoneChallenges = useMemo(
    () => (zoneChallengeMap[currentZoneId] ?? [])
      .map((challengeId) => category.challenges.find((challenge) => challenge.id === challengeId) ?? null)
      .filter(Boolean),
    [category.challenges, currentZoneId, zoneChallengeMap],
  )
  const currentZoneHotspot = useMemo(
    () => category.mapHotspots?.find((hotspot) => hotspot.id === currentZoneId) ?? null,
    [category.mapHotspots, currentZoneId],
  )
  const [pendingIntroZoneId, setPendingIntroZoneId] = useState(
    () => (persistedSession ? '' : currentChallenge?.zoneId ?? ''),
  )

  useEffect(() => {
    if (
      sessionCorrectCount >= 8 &&
      immediateUnlockTargets.length &&
      !hasUnlockedByScore &&
      !hasUnlockedTargets
    ) {
      unlockCategories(immediateUnlockTargets)
    }
  }, [
    hasUnlockedByScore,
    hasUnlockedTargets,
    immediateUnlockTargets,
    playerState.unlockedCategoryIds,
    sessionCorrectCount,
    unlockCategories,
  ])

  useEffect(() => {
    if (!isComplete || hasPersistedOutcomeRef.current) {
      return
    }

    registerRoomOutcome({
      categoryId: category.id,
      correctCount: sessionCorrectCount,
      wrongCount: sessionWrongCount,
      totalChallenges,
      unlockedCategoryIds: immediateUnlockTargets,
    })
    hasPersistedOutcomeRef.current = true
  }, [
    category.id,
    immediateUnlockTargets,
    isComplete,
    registerRoomOutcome,
    sessionCorrectCount,
    sessionWrongCount,
    totalChallenges,
  ])

  function handleSubmit(event) {
    event.preventDefault()
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

    registerQuizAttempt()
    const feedbackChallenge =
      category.challenges.find((challenge) => challenge.id === nextFeedback.attemptedChallengeId) ?? currentChallenge
    const awardedCredits = resolveChallengeCreditReward(feedbackChallenge, nextFeedback)

    applyChallengeFeedbackOutcome({
      awardedCredits,
      consumeLife: !nextFeedback.isCorrect,
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
    restartSession()
  }

  const shouldShowMusicIntro = category.id === 'musica' && isRoomIntroPending('musica')

  useEffect(() => {
    if (isComplete) {
      clearActiveSession()
      return
    }

    if (!currentChallenge || shouldShowMusicIntro) {
      return
    }

    syncActiveSessionSnapshot(
      {
        categoryId: category.id,
        currentChallengeId,
        challengeResults,
        draftAnswer,
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
    challengeState,
    clearActiveSession,
    currentChallenge,
    currentChallengeId,
    draftAnswer,
    isComplete,
    isHintVisible,
    resolvedChallengeIds,
    sessionCorrectCount,
    sessionWrongCount,
    shouldShowMusicIntro,
    syncActiveSessionSnapshot,
  ])

  const challengeMapLocked = !canAttemptQuiz() && !isComplete
  const currentChallengeLocked =
    challengeMapLocked &&
    !hasFeedback &&
    !isCurrentChallengeResolved

  const isChallengeIntroVisible =
    isMusicRoom &&
    pendingIntroZoneId === currentZoneId &&
    Boolean(currentZoneId) &&
    !challengeMapLocked
  const shouldPauseHesitationTimer =
    category.id === 'musica' &&
    isChallengeIntroVisible &&
    !isCurrentChallengeResolved &&
    canAttemptQuiz() &&
    !isComplete
  const currentZoneIntroText =
    currentZoneHotspot?.introPrompt ||
    currentZoneHotspot?.description ||
    currentZoneChallenges[0]?.prompt ||
    currentChallenge?.prompt ||
    'La prova ti aspetta.'

  // Trigger hesitation after a time threshold if the user hasn't answered yet.
  useEffect(() => {
    if (!currentChallenge || hasFeedback || isComplete || shouldPauseHesitationTimer) {
      if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current)
      return
    }
    const delay = HESITATION_TIME_THRESHOLDS_MS[currentChallenge.type] ?? HESITATION_TIME_THRESHOLDS_MS.default
    const id = setTimeout(() => {
      if (!hesitationFiredRef.current) {
        hesitationFiredRef.current = true
        showComment('onHesitation')
      }
    }, delay)
    hesitationTimerRef.current = id
    return () => clearTimeout(id)
  }, [hesitationScopeKey, hasFeedback, isComplete, currentChallenge, shouldPauseHesitationTimer, showComment])

  useBackgroundAudio({ src: '/audio/bg_music_room.mp3', volume: 0.15 }, isChallengeIntroVisible)

  // Music room intro narrative gate (shown once)
  if (shouldShowMusicIntro) {
    return (
      <MusicRoomNarrative
        category={category}
        onComplete={markMusicRoomIntroSeen}
      />
    )
  }

  if (isComplete) {
    const passedRoom = sessionCorrectCount >= 8

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
    currentChallengeLocked
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
  const errorVisualIndex = sessionWrongCount > 0
    ? (sessionWrongCount - 1) % ERROR_IMAGES.length
    : 0
  const roomInteractionsDisabled = isSubmitting || hasFeedback || challengeMapLocked
  const hasInfo = Boolean(currentChallenge.infoText || currentChallenge.prompt)
  const infoDisabled = roomInteractionsDisabled || !hasInfo
  const infoDisabledReason = !hasInfo
    ? 'Nessuna informazione disponibile per questa prova.'
    : challengeMapLocked
      ? 'Hai finito i tentativi per oggi.'
      : ''
  const hasHint = Boolean(currentChallenge.hint)
  const canAffordHint = credits >= (currentChallenge.hintCost ?? 0)
  const hintDisabled =
    roomInteractionsDisabled ||
    !hasHint ||
    (!isHintVisible && !canAffordHint)
  const hintDisabledReason = !hasHint
    ? 'Nessun indizio disponibile per questa prova.'
    : challengeMapLocked
      ? 'Hai finito i tentativi per oggi.'
      : !isHintVisible && !canAffordHint
          ? 'Crediti insufficienti per usare l\'indizio.'
          : ''
  const mapDisabled = roomInteractionsDisabled
  const mapDisabledReason = challengeMapLocked ? 'Hai finito i tentativi per oggi.' : ''
  const challengeInfoText = currentChallenge.infoText || currentChallenge.prompt || ''
  const canPurchaseHint =
    !roomInteractionsDisabled &&
    hasHint &&
    !isHintVisible &&
    canAffordHint
  const isHintModalOpen = hintModalChallengeId === currentChallengeId && !hasFeedback
  const isInfoModalOpen = infoModalChallengeId === currentChallengeId && !hasFeedback
  const isRoomMapOpen = isRoomMapVisible && !hasFeedback
  const limitBanner = challengeMapLocked ? (
    <div className="rounded-[1.4rem] border border-amber-300/25 bg-amber-300/10 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-100/80">
        Limite raggiunto
      </p>
      <p className="mt-2 text-sm leading-6 text-amber-50/90">
        Hai finito i tentativi per oggi.
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

    clearResultComment()
    dismissFeedback()
    setInfoModalChallengeId('')
    setHintModalChallengeId('')
    setPendingIntroZoneId(zoneId)
    selectChallenge(nextChallengeId, { openResolvedFeedback: false })
    setIsRoomMapVisible(false)
  }

  const shouldShowDefaultFloatingPanel =
    activePanel?.eventType === 'onHesitation' || activePanel?.eventType === 'onHintUsed'
  const isHesitationPanelVisible = activePanel?.eventType === 'onHesitation'
  const zoneNavigatorSide = (
    <ZoneChallengeNavigator
      challenges={currentZoneChallenges}
      currentChallengeId={currentChallengeId}
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

  return (
    <>
      {isMusicRoom ? (
        <>
          <RoomPlayLayout
            attemptsRemaining={attemptsRemaining}
            banner={limitBanner}
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
          >
            {isChallengeIntroVisible ? (
              <div className="space-y-4">
                <MusicChallengeIntro
                  key={currentZoneId}
                  character={getRoomCharacterBySpeaker(category.characters, 'guardian')}
                  introText={currentZoneIntroText}
                  onComplete={() => {
                    setPendingIntroZoneId('')

                    if (isCurrentChallengeResolved) {
                      selectChallenge(currentChallengeId)
                    }
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {currentChallengeLocked ? <DailyLimitOverlay /> : null}

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
                          disabled={controlsDisabled}
                          draftAnswer={draftAnswer}
                          onAudioPlay={handleAudioPlay}
                          onChallengeStateChange={updateChallengeState}
                          onDraftAnswerChange={updateDraftAnswer}
                          onSubmit={handleSubmit}
                          showHeader={false}
                        />
                      </div>
                    </div>

                    {currentZoneChallenges.length > 1 ? (
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
              isMusicRoom && hasFeedback && !feedback.isCorrect
                ? (ERROR_IMAGES[errorVisualIndex] ?? null)
                : null
            }
            errorOpacity={
              isMusicRoom && hasFeedback && !feedback.isCorrect
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

              if (nextChallenge?.zoneId && nextChallenge.zoneId !== currentZoneId) {
                setPendingIntroZoneId(nextChallenge.zoneId)
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

            <ChallengeProgress
              challengeNumber={challengeNumber}
              completedChallenges={resolvedChallengeCount}
              totalChallenges={totalChallenges}
              title={currentChallenge.title}
              type={currentChallenge.type}
            />

            <div className="relative space-y-4 rounded-[1.75rem] border border-slate-800 bg-slate-950/55 p-5 sm:p-6" ref={challengeMediaRef}>
              {currentChallengeLocked ? <DailyLimitOverlay /> : null}
              <ChallengeRenderer
                challenge={currentChallenge}
                challengeState={challengeState}
                disabled={controlsDisabled}
                draftAnswer={draftAnswer}
                onAudioPlay={handleAudioPlay}
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