function FreeTextChallenge({ challenge, draftAnswer, onDraftAnswerChange, onSubmit, disabled }) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <label className="block text-xl font-semibold leading-8 text-white" htmlFor={challenge.id}>
          {challenge.prompt}
        </label>
        <input
          autoComplete="off"
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/55 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id={challenge.id}
          onChange={(event) => onDraftAnswerChange({ textAnswer: event.target.value })}
          placeholder="Affida una parola alla sala"
          type="text"
          value={draftAnswer.textAnswer}
        />
      </div>

      <button
        className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || !draftAnswer.textAnswer.trim()}
        type="submit"
      >
        Conferma prova
      </button>
    </form>
  )
}

export default FreeTextChallenge