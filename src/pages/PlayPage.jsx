import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ChallengeCompleted from '../components/challenges/ChallengeCompleted.jsx'
import ChallengeFeedback from '../components/challenges/ChallengeFeedback.jsx'
import ChallengeHintPanel from '../components/challenges/ChallengeHintPanel.jsx'
import ChallengeLayout from '../components/challenges/ChallengeLayout.jsx'
import ChallengeProgress from '../components/challenges/ChallengeProgress.jsx'
import ChallengeRenderer from '../components/challenges/ChallengeRenderer.jsx'
import ChallengeSelectorGrid from '../components/challenges/ChallengeSelectorGrid.jsx'
import CharacterToast from '../components/music-room/CharacterToast.jsx'
import MusicRoomNarrative from '../components/music-room/MusicRoomNarrative.jsx'
import { useCharacterComments } from '../hooks/useCharacterComments'
import { useChallengeSession } from '../hooks/useChallengeSession'
import { usePlayerState } from '../hooks/usePlayerState'
import { getCategoryById } from '../lib/challengeData'

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
          to="/map"
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

function PlayCategorySession({ category, preferredChallengeId }) {
  const [isRoomMapVisible, setIsRoomMapVisible] = useState(false)
  const audioPlayCountRef = useRef(0)
  const hesitationFiredRef = useRef(false)
  const {
    playerState,
    getRoomProgress,
    registerRoomOutcome,
    unlockCategories,
    addCredits,
    spendCredits,
    registerQuizAttempt,
    registerWrongAnswer,
    markMusicRoomIntroSeen,
    canAttemptQuiz,
    getCredits,
  } = usePlayerState()
  const { activeToast, showComment, dismissToast } = useCharacterComments(
    category.characterComments,
    category.characters,
  )
  const {
    challengeNumber,
    currentChallengeId,
    challengeState,
    currentChallenge,
    draftAnswer,
    feedback,
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
  } = useChallengeSession(category, preferredChallengeId)
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
    registerQuizAttempt()
    submitChallenge()
  }

  // React to feedback changes for credits & character comments
  const prevFeedbackIdRef = useRef('')
  useEffect(() => {
    if (!feedback.attemptedChallengeId || feedback.attemptedChallengeId === prevFeedbackIdRef.current) {
      return
    }
    prevFeedbackIdRef.current = feedback.attemptedChallengeId

    if (feedback.isCorrect) {
      const reward = currentChallenge?.creditReward ?? 10
      addCredits(reward)
      showComment('onCorrect')
    } else {
      registerWrongAnswer()
      showComment('onWrong')
    }
  }, [feedback.attemptedChallengeId, feedback.isCorrect, currentChallenge, addCredits, registerWrongAnswer, showComment])

  // Reset audio-play hesitation counter when challenge changes
  useEffect(() => {
    audioPlayCountRef.current = 0
    hesitationFiredRef.current = false
  }, [currentChallengeId])

  const handleAudioPlay = useCallback(() => {
    audioPlayCountRef.current += 1
    if (audioPlayCountRef.current >= HESITATION_AUDIO_PLAY_THRESHOLD && !hesitationFiredRef.current) {
      hesitationFiredRef.current = true
      showComment('onHesitation')
    }
  }, [showComment])

  function handleHintReveal() {
    const cost = currentChallenge?.hintCost ?? 15
    if (!spendCredits(cost)) return
    revealHint()
    showComment('onHintUsed')
  }

  function handleRestart() {
    hasPersistedOutcomeRef.current = false
    restartSession()
  }

  // Music room intro narrative gate (shown once)
  if (category.id === 'musica' && !playerState.hasSeenMusicRoomIntro) {
    return (
      <MusicRoomNarrative
        category={category}
        onComplete={markMusicRoomIntroSeen}
      />
    )
  }

  const dailyLimitReached = !canAttemptQuiz() && !isComplete

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

  const controlsDisabled = isSubmitting || hasFeedback || isCurrentChallengeResolved || dailyLimitReached
  const credits = getCredits()
  const attemptsRemaining = 3 - (playerState.stats?.quizzesAttempted ?? 0)
  const livesRemaining = 2 - (playerState.stats?.wrongAnswersToday ?? 0)

  return (
    <>
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
              {isRoomMapVisible ? 'Nascondi mappa quiz' : 'Mostra mappa quiz'}
            </button>
          </div>

          {isRoomMapVisible ? (
            <div>
              <ChallengeSelectorGrid
                category={category}
                currentChallengeId={currentChallengeId}
                interactionDisabled={dailyLimitReached}
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

          <div className="relative space-y-4 rounded-[1.75rem] border border-slate-800 bg-slate-950/55 p-5 sm:p-6">
            {dailyLimitReached ? <DailyLimitOverlay /> : null}
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
              credits={credits}
              disabled={controlsDisabled}
              hint={currentChallenge.hint}
              hintCost={currentChallenge.hintCost}
              isVisible={isHintVisible}
              onReveal={handleHintReveal}
            />

            {hasFeedback ? (
              <ChallengeFeedback
                creditReward={currentChallenge.creditReward}
                feedback={feedback}
                onContinue={goToNextChallenge}
              />
            ) : null}
          </div>
        </div>
      </ChallengeLayout>

      {activeToast ? (
        <CharacterToast toast={activeToast} onDismiss={dismissToast} />
      ) : null}
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