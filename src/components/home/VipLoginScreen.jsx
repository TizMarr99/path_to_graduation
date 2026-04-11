function VipLoginScreen({
  code,
  errorMessage,
  hasVipAccess,
  isLeaving,
  onCodeChange,
  onSubmit,
}) {
  return (
    <section
      className={[
        'relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(120,113,108,0.18),_transparent_30%),linear-gradient(180deg,_#050505_0%,_#111111_48%,_#050505_100%)] px-6 py-10 text-amber-50 transition duration-700 ease-out',
        isLeaving ? 'pointer-events-none opacity-0 scale-[0.985]' : 'opacity-100 scale-100',
      ].join(' ')}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.02)_0%,transparent_30%,transparent_70%,rgba(255,255,255,0.02)_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(212,175,55,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative w-full max-w-xl rounded-[2rem] border border-amber-300/25 bg-black/45 px-8 py-10 shadow-[0_0_80px_rgba(212,175,55,0.08)] backdrop-blur-xl sm:px-10 sm:py-12">
        <div className="flex flex-col items-center text-center">
          <img
            alt="VIP"
            className="h-36 w-auto sm:h-44"
            src="/images/logo-vip.png"
          />
          <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-amber-200/75">
            Invito Riservato
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[0.08em] text-amber-50 sm:text-4xl">
            Accesso alla mostra privata
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-stone-300 sm:text-base">
            Inserisci il tuo codice personale per aprire le porte della galleria.
          </p>
        </div>

        <form className="mt-10 space-y-5" onSubmit={onSubmit}>
          <label className="block text-left" htmlFor="vip-code">
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-amber-200/80">
              Codice Personale
            </span>
            <input
              autoComplete="off"
              className="mt-3 w-full rounded-full border border-amber-300/45 bg-black/65 px-6 py-4 text-center text-lg font-medium tracking-[0.35em] text-amber-50 outline-none transition placeholder:text-amber-100/25 focus:border-amber-200 focus:ring-2 focus:ring-amber-300/20"
              id="vip-code"
              inputMode="numeric"
              maxLength={6}
              name="vip-code"
              onChange={(event) => onCodeChange(event.target.value)}
              placeholder={hasVipAccess ? 'Accesso gia autorizzato' : '000000'}
              value={code}
            />
          </label>

          {hasVipAccess ? (
            <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-amber-200/70">
              Accesso VIP gia verificato. Premi entra per rivedere l&apos;introduzione.
            </p>
          ) : null}

          <button
            className="w-full rounded-full border border-amber-300/55 bg-amber-300/10 px-6 py-4 text-sm font-semibold uppercase tracking-[0.35em] text-amber-50 transition hover:border-amber-200 hover:bg-amber-300/18 focus:outline-none focus:ring-2 focus:ring-amber-300/25"
            type="submit"
          >
            Entra
          </button>

          <p
            aria-live="polite"
            className={[
              'min-h-6 text-center text-sm transition duration-300',
              errorMessage ? 'text-amber-200 opacity-100' : 'opacity-0',
            ].join(' ')}
          >
            {errorMessage || 'Codice non valido'}
          </p>
        </form>
      </div>
    </section>
  )
}

export default VipLoginScreen