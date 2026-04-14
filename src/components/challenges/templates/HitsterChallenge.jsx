import { useState } from 'react'
import { evaluateTitleAuthorMatch } from '../../../lib/answerNormalization'
import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function HitsterChallenge({
  challenge,
  draftAnswer,
  challengeState,
  onDraftAnswerChange,
  onChallengeStateChange,
  onSubmit,
  disabled,
  onAudioPlay,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const revealedTrackCount = challengeState.hitsterRevealedTrackCount ?? 0
  const activeTrack = revealedTrackCount < challenge.tracks.length
    ? challenge.tracks[revealedTrackCount]
    : null
  const orderedTracks = draftAnswer.hitsterTrackOrderIds.map((trackId) =>
    challenge.tracks.find((track) => track.id === trackId) ?? null,
  )
  const allTracksRevealed = revealedTrackCount >= challenge.tracks.length

  function handleMoveToSlot(sourceIndex, targetIndex) {
    const currentSlots = [...draftAnswer.hitsterTrackOrderIds]

    if (
      sourceIndex < 0 ||
      targetIndex < 0 ||
      sourceIndex >= currentSlots.length ||
      targetIndex >= currentSlots.length ||
      sourceIndex === targetIndex
    ) {
      return
    }

    const sourceTrackId = currentSlots[sourceIndex]
    const targetTrackId = currentSlots[targetIndex]

    if (!sourceTrackId) {
      return
    }

    currentSlots[targetIndex] = sourceTrackId
    currentSlots[sourceIndex] = targetTrackId || ''

    onDraftAnswerChange({
      hitsterTrackOrderIds: currentSlots,
    })
  }

  function handleTrackAnswerChange(trackId, field, value) {
    onDraftAnswerChange({
      hitsterTrackAnswers: {
        ...draftAnswer.hitsterTrackAnswers,
        [trackId]: {
          ...(draftAnswer.hitsterTrackAnswers?.[trackId] ?? {
            titleAnswer: '',
            artistAnswer: '',
          }),
          [field]: value,
        },
      },
    })
  }

  function handleRevealCurrentTrack() {
    if (disabled || !activeTrack) {
      return
    }

    const alreadyPresent = draftAnswer.hitsterTrackOrderIds.includes(activeTrack.id)
    const firstEmptyIndex = draftAnswer.hitsterTrackOrderIds.findIndex((trackId) => !trackId)
    const nextTrackOrderIds = [...draftAnswer.hitsterTrackOrderIds]

    if (!alreadyPresent && firstEmptyIndex >= 0) {
      nextTrackOrderIds[firstEmptyIndex] = activeTrack.id
    }

    onDraftAnswerChange({
      hitsterTrackOrderIds: alreadyPresent
        ? draftAnswer.hitsterTrackOrderIds
        : nextTrackOrderIds,
    })
    onChallengeStateChange({
      hitsterRevealedTrackCount: Math.min(
        challenge.tracks.length,
        revealedTrackCount + 1,
      ),
    })
  }

  function handleDrop(targetIndex) {
    if (draggedIndex === null) {
      return
    }

    handleMoveToSlot(draggedIndex, targetIndex)
    setDraggedIndex(null)
  }

  function renderTrackReveal(track) {
    const answers = draftAnswer.hitsterTrackAnswers?.[track.id] ?? {
      titleAnswer: '',
      artistAnswer: '',
    }
    const guessResult = evaluateTitleAuthorMatch(
      answers.titleAnswer,
      track.titleAcceptedAnswers,
      answers.artistAnswer,
      track.artistAcceptedAnswers,
    )

    return (
      <div className="space-y-3 rounded-2xl border border-amber-300/20 bg-amber-300/8 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-100/75">
          Soluzione rivelata
        </p>
        <p className="text-sm leading-6 text-amber-50">
          {track.artist} · {track.title}
        </p>
        <p className="text-xs uppercase tracking-[0.22em] text-amber-100/75">
          Guess bonus: {guessResult.authorMatched ? 'artista ok' : 'artista no'} · {guessResult.titleMatched ? 'titolo ok' : 'titolo no'}
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-300">
          Una traccia alla volta: provi a indovinare artista e titolo, la soluzione viene rivelata e la carta entra nel primo slot libero da sinistra. Dopo puoi trascinarla in qualunque casella: se e vuota si sposta, se e occupata avviene lo scambio.
        </p>

        {activeTrack ? (
          <article className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
                Traccia {revealedTrackCount + 1}
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {revealedTrackCount}/{challenge.tracks.length} gia rivelate
              </p>
            </div>

            <ChallengeAssetGallery assets={activeTrack.assets} onAudioPlay={onAudioPlay} />

            <div className="grid gap-3 md:grid-cols-2">
              <input
                autoComplete="off"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={disabled}
                onChange={(event) =>
                  handleTrackAnswerChange(activeTrack.id, 'titleAnswer', event.target.value)
                }
                placeholder="Titolo bonus"
                type="text"
                value={draftAnswer.hitsterTrackAnswers?.[activeTrack.id]?.titleAnswer ?? ''}
              />

              <input
                autoComplete="off"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={disabled}
                onChange={(event) =>
                  handleTrackAnswerChange(activeTrack.id, 'artistAnswer', event.target.value)
                }
                placeholder="Artista bonus"
                type="text"
                value={draftAnswer.hitsterTrackAnswers?.[activeTrack.id]?.artistAnswer ?? ''}
              />
            </div>

            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-950/85 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled}
              onClick={handleRevealCurrentTrack}
              type="button"
            >
              Rivela e posiziona traccia
            </button>
          </article>
        ) : (
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-5 py-4 text-sm leading-6 text-emerald-50">
            Tutte le tracce sono state rivelate. Ora puoi rifinire l'ordine e confermare la prova per vedere anche gli anni.
          </div>
        )}

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/65 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
            Ordine cronologico finale
          </p>
          <div className="grid gap-3 md:grid-cols-5">
            {Array.from({ length: challenge.tracks.length }, (_, slotIndex) => {
              const track = orderedTracks[slotIndex] ?? null

              return (
                <div
                  key={`hitster-slot-${slotIndex}`}
                  className={[
                    'min-h-40 rounded-2xl border border-dashed p-3 transition',
                    track
                      ? 'border-cyan-300/30 bg-cyan-400/8'
                      : 'border-slate-700 bg-slate-900/55',
                  ].join(' ')}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(slotIndex)}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Slot {slotIndex + 1}
                  </p>

                  {track ? (
                    <div
                      className="mt-3 cursor-grab space-y-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 active:cursor-grabbing"
                      draggable={!disabled}
                      onDragEnd={() => setDraggedIndex(null)}
                      onDragStart={() => setDraggedIndex(slotIndex)}
                    >
                      <p className="text-sm font-semibold text-white">{track.title}</p>
                      {renderTrackReveal(track)}
                    </div>
                  ) : (
                    <div className="mt-3 flex min-h-24 items-center justify-center rounded-2xl border border-white/5 bg-slate-950/35 text-center text-xs uppercase tracking-[0.22em] text-slate-500">
                      Casella vuota
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ChallengeSubmitButton disabled={disabled || !allTracksRevealed} />
    </form>
  )
}

export default HitsterChallenge