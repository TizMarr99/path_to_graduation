import ReorderableList from '../common/ReorderableList.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function SequenceReconstructionChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onSubmit,
  disabled,
}) {
  const segmentsById = Object.fromEntries(
    challenge.segments.map((segment) => [segment.id, segment]),
  )
  const orderedSegments = draftAnswer.sequenceOrderIds
    .map((segmentId) => segmentsById[segmentId])
    .filter(Boolean)

  function handleMove(sourceIndex, targetIndex) {
    const nextOrder = [...draftAnswer.sequenceOrderIds]
    const [movedSegmentId] = nextOrder.splice(sourceIndex, 1)
    nextOrder.splice(targetIndex, 0, movedSegmentId)
    onDraftAnswerChange({ sequenceOrderIds: nextOrder })
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold leading-8 text-white">{challenge.prompt}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Ricostruisci la sequenza corretta riordinando i frammenti disponibili.
          </p>
        </div>

        <ReorderableList disabled={disabled} items={orderedSegments} onMove={handleMove} />
      </div>

      <ChallengeSubmitButton
        disabled={disabled || orderedSegments.length !== challenge.segments.length}
      />
    </form>
  )
}

export default SequenceReconstructionChallenge