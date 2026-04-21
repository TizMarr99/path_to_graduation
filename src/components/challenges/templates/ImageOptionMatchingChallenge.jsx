import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function ImageOptionMatchingChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onSubmit,
  disabled,
}) {
  const selections = draftAnswer.imageOptionSelections ?? {}
  const hasAnySelection = Object.values(selections).some(Boolean)

  function handleSelect(itemId, optionId) {
    onDraftAnswerChange({
      imageOptionSelections: {
        ...selections,
        [itemId]: optionId,
      },
    })
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-300">
          Associa ogni elemento all'opzione corretta. Servono almeno{' '}
          {challenge.minimumCorrectPairs} abbinamenti corretti.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenge.items.map((item) => (
            <div
              key={item.id}
              className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4"
            >
              <ChallengeAssetGallery assets={item.assets} />

              {item.label && (
                <p className="text-center text-xs font-medium text-slate-400">
                  {item.label}
                </p>
              )}

              <div className="space-y-1.5">
                {challenge.options.map((option) => {
                  const isSelected = selections[item.id] === option.id
                  const hasVisualCue = Boolean(option.icon || option.label || option.assets?.length)

                  return (
                    <button
                      key={option.id}
                      className={[
                        'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition',
                        isSelected
                          ? 'border-cyan-300/50 bg-cyan-400/15 text-cyan-100'
                          : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-600',
                        disabled ? 'cursor-not-allowed opacity-60' : '',
                      ].join(' ')}
                      disabled={disabled}
                      onClick={() => handleSelect(item.id, option.id)}
                      type="button"
                    >
                      {option.icon && (
                        <img
                          alt={option.label}
                          className="h-6 w-6 shrink-0 rounded object-contain"
                          src={option.icon}
                        />
                      )}
                      {option.assets?.length ? (
                        <div className="min-w-0 flex-1">
                          <ChallengeAssetGallery assets={option.assets} />
                        </div>
                      ) : null}
                      {option.label ? <span>{option.label}</span> : null}
                      {!hasVisualCue ? <span>Opzione</span> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ChallengeSubmitButton disabled={disabled || !hasAnySelection} />
    </form>
  )
}

export default ImageOptionMatchingChallenge
