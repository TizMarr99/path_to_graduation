function ChallengeSubmitButton({ disabled, label = 'Conferma prova' }) {
  return (
    <button
      className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      type="submit"
    >
      {label}
    </button>
  )
}

export default ChallengeSubmitButton