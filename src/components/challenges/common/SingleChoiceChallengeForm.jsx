import ChallengeAssetGallery from './ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from './ChallengeSubmitButton.jsx'

function SingleChoiceChallengeForm({
  challengeId,
  prompt,
  assets,
  options,
  selectedValue,
  onChange,
  onSubmit,
  disabled,
  inputName,
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <fieldset className="space-y-4" disabled={disabled}>
        <legend className="text-xl font-semibold leading-8 text-white">{prompt}</legend>

        <ChallengeAssetGallery assets={assets} />

        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedValue === option.id

            return (
              <label
                key={option.id}
                className={[
                  'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition',
                  isSelected
                    ? 'border-amber-300/70 bg-amber-300/10 text-amber-50'
                    : 'border-slate-800 bg-slate-900/70 text-slate-200 hover:border-cyan-300/45 hover:bg-slate-900',
                  disabled ? 'cursor-not-allowed opacity-75' : '',
                ].join(' ')}
              >
                <input
                  checked={isSelected}
                  className="mt-1 h-4 w-4 border-slate-600 bg-slate-950 text-amber-300"
                  name={inputName ?? challengeId}
                  onChange={() => onChange(option.id)}
                  type="radio"
                  value={option.id}
                />
                <span className="text-sm leading-6">
                  {option.text}
                  {option.description ? (
                    <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-slate-400">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <ChallengeSubmitButton disabled={disabled || !selectedValue} />
    </form>
  )
}

export default SingleChoiceChallengeForm