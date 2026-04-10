function MultipleChoiceChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onSubmit,
  disabled,
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <fieldset className="space-y-4" disabled={disabled}>
        <legend className="text-xl font-semibold leading-8 text-white">
          {challenge.prompt}
        </legend>

        <div className="space-y-3">
          {challenge.choices.map((choice) => {
            const isSelected = draftAnswer.selectedChoiceId === choice.id

            return (
              <label
                key={choice.id}
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
                  name={challenge.id}
                  onChange={() => onDraftAnswerChange({ selectedChoiceId: choice.id })}
                  type="radio"
                  value={choice.id}
                />
                <span className="text-sm leading-6">{choice.text}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <button
        className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || !draftAnswer.selectedChoiceId}
        type="submit"
      >
        Conferma prova
      </button>
    </form>
  )
}

export default MultipleChoiceChallenge