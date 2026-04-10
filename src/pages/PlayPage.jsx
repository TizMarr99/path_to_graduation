import { Link, useParams } from 'react-router-dom'
import ChallengeCompleted from '../components/challenges/ChallengeCompleted.jsx'
import ChallengeFeedback from '../components/challenges/ChallengeFeedback.jsx'
import ChallengeHintPanel from '../components/challenges/ChallengeHintPanel.jsx'
import ChallengeLayout from '../components/challenges/ChallengeLayout.jsx'
import ChallengeProgress from '../components/challenges/ChallengeProgress.jsx'
import ChallengeRenderer from '../components/challenges/ChallengeRenderer.jsx'
import { useChallengeSession } from '../hooks/useChallengeSession'
import { getCategoryById } from '../lib/challengeData'

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
          to="/play/musica"
        >
          Apri /play/musica
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

function PlayCategorySession({ category }) {
  const {
    challengeNumber,
    challengeState,
    currentChallenge,
    draftAnswer,
    feedback,
    goToNextChallenge,
    hasFeedback,
    isComplete,
    isHintVisible,
    isSubmitting,
    progressLabel,
    revealHint,
    restartSession,
    submitChallenge,
    totalChallenges,
    updateChallengeState,
    updateDraftAnswer,
  } = useChallengeSession(category)

  function handleSubmit(event) {
    event.preventDefault()
    submitChallenge()
  }

  if (isComplete) {
    return (
      <ChallengeCompleted
        category={category}
        onRestart={restartSession}
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

  const controlsDisabled = isSubmitting || hasFeedback

  return (
    <ChallengeLayout category={category} progressLabel={progressLabel}>
      <div className="space-y-6">
        <ChallengeProgress
          challengeNumber={challengeNumber}
          difficulty={currentChallenge.difficulty}
          totalChallenges={totalChallenges}
          type={currentChallenge.type}
        />

        <div className="space-y-6 rounded-[1.75rem] border border-slate-800 bg-slate-950/55 p-6 sm:p-7">
          <ChallengeRenderer
            challenge={currentChallenge}
            challengeState={challengeState}
            disabled={controlsDisabled}
            draftAnswer={draftAnswer}
            onChallengeStateChange={updateChallengeState}
            onDraftAnswerChange={updateDraftAnswer}
            onSubmit={handleSubmit}
          />

          <ChallengeHintPanel
            disabled={controlsDisabled}
            hint={currentChallenge.hint}
            isVisible={isHintVisible}
            onReveal={revealHint}
          />

          {hasFeedback ? (
            <ChallengeFeedback feedback={feedback} onContinue={goToNextChallenge} />
          ) : null}
        </div>
      </div>
    </ChallengeLayout>
  )
}

function PlayPage() {
  const { categoryId } = useParams()
  const category = getCategoryById(categoryId)

  if (!category) {
    return <NotFoundState categoryId={categoryId ?? 'sconosciuta'} />
  }

  return <PlayCategorySession key={category.id} category={category} />
}

export default PlayPage