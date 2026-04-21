import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

const SUIT_COLORS = {
  hearts: 'text-red-400',
  diamonds: 'text-red-400',
  clubs: 'text-slate-200',
  spades: 'text-slate-200',
}

function CardMatchingChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onSubmit,
  disabled,
}) {
  const selections = draftAnswer.cardSelections ?? {}
  const hasAnySelection = Object.values(selections).some(
    (sel) => sel?.number || sel?.suit,
  )

  function handleChange(itemId, field, value) {
    const current = selections[itemId] ?? { number: '', suit: '' }
    onDraftAnswerChange({
      cardSelections: {
        ...selections,
        [itemId]: { ...current, [field]: value },
      },
    })
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-300">
          Assegna a ogni personaggio il numero e il seme della sua carta.
          Servono almeno {challenge.minimumCorrect} abbinamenti corretti.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenge.items.map((item) => {
            const sel = selections[item.id] ?? { number: '', suit: '' }

            return (
              <div
                key={item.id}
                className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4"
              >
                <ChallengeAssetGallery assets={item.assets} />

                <div className="flex gap-2">
                  <select
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={disabled}
                    onChange={(e) => handleChange(item.id, 'number', e.target.value)}
                    value={sel.number}
                  >
                    <option value="">Numero</option>
                    {challenge.numberOptions.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {challenge.suitOptions.map((suit) => {
                    const isSelected = sel.suit === suit
                    return (
                      <button
                        key={suit}
                        className={[
                          'rounded-xl border px-2 py-2 text-lg font-semibold transition',
                          isSelected
                            ? 'border-cyan-300/55 bg-cyan-400/15'
                            : 'border-slate-700 bg-slate-950/70 hover:border-slate-500',
                          SUIT_COLORS[suit] ?? 'text-slate-100',
                          disabled ? 'cursor-not-allowed opacity-60' : '',
                        ].join(' ')}
                        disabled={disabled}
                        onClick={() => handleChange(item.id, 'suit', suit)}
                        title={suit}
                        type="button"
                      >
                        {SUIT_SYMBOLS[suit] ?? suit}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ChallengeSubmitButton disabled={disabled || !hasAnySelection} />
    </form>
  )
}

export default CardMatchingChallenge
