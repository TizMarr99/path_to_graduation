import ReorderableList from '../common/ReorderableList.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function OrderingChallenge({ challenge, draftAnswer, onDraftAnswerChange, onSubmit, disabled }) {
  const itemsById = Object.fromEntries(
    challenge.items.map((item) => [item.id, item]),
  )
  const orderedItems = draftAnswer.orderedItemIds
    .map((itemId) => itemsById[itemId])
    .filter(Boolean)

  function handleMove(sourceIndex, targetIndex) {
    const nextOrder = [...draftAnswer.orderedItemIds]
    const [movedItemId] = nextOrder.splice(sourceIndex, 1)
    nextOrder.splice(targetIndex, 0, movedItemId)
    onDraftAnswerChange({ orderedItemIds: nextOrder })
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold leading-8 text-white">{challenge.prompt}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Riordina gli elementi con i controlli accessibili fino a ricostruire la sequenza corretta.
          </p>
        </div>

        <ReorderableList disabled={disabled} items={orderedItems} onMove={handleMove} />
      </div>

      <ChallengeSubmitButton disabled={disabled || orderedItems.length !== challenge.items.length} />
    </form>
  )
}

export default OrderingChallenge