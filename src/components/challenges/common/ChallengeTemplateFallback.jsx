function ChallengeTemplateFallback({ challenge, reason }) {
  return (
    <section className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-100/80">
        Template non disponibile
      </p>
      <h3 className="mt-3 text-xl font-semibold text-white">{challenge.prompt}</h3>
      <p className="mt-3 text-sm leading-7 text-rose-50/90">
        {reason ?? 'Questa challenge e dichiarata ma il renderer non e ancora completo.'}
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.24em] text-rose-100/75">
        Tipo: {challenge.type}
      </p>
    </section>
  )
}

export default ChallengeTemplateFallback