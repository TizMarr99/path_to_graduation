/** Presentation only: revealed clues and answers remain in the session draft. */
export default function ProgressiveClueBoard({ challenge, round, visible, value, disabled, onChange, onReveal }) {
  const emoji = challenge.quizSubType === 'brand_emoji'
  const points = Math.max(1, 4 - visible)
  const complete = visible >= round.clues.length
  return <div className="clue-workspace">
    <section className="clue-evidence" aria-label={emoji ? 'Emoji del brand' : 'Indizi del brand'}>
      <div className="round-section-heading">
        <span className="round-eyebrow">{emoji ? 'Leggi il rebus' : round.title || 'Segui le tracce'}</span>
        <span className="round-counter">{visible} / {round.clues.length} {emoji ? 'emoji' : 'indizi'}</span>
      </div>
      <div className={emoji ? 'emoji-clues' : 'text-clues'} aria-live="polite" aria-relevant="additions">
        {round.clues.map((clue, i) => i < visible ? <div key={`${round.id}-${i}`} className={emoji ? 'emoji-clue' : 'text-clue'}>
          <span className="clue-number">{String(i + 1).padStart(2, '0')}</span>
          <p>{clue}</p>
        </div> : <div key={`${round.id}-${i}`} className={emoji ? 'emoji-clue clue-hidden' : 'text-clue clue-hidden'} aria-hidden="true">
          <span className="clue-number">{String(i + 1).padStart(2, '0')}</span>
          <span>{emoji ? '?' : 'Indizio da rivelare'}</span>
        </div>)}
      </div>
      <div className="clue-reveal-row">
        <button className="round-reveal" type="button" disabled={disabled || complete} onClick={onReveal}>
          <span aria-hidden="true">{complete ? '✓' : '+'}</span>
          {complete ? 'Tutti gli indizi rivelati' : emoji ? 'Rivela un’altra emoji' : 'Rivela un altro indizio'}
        </button>
        {!complete ? <p>Un aiuto in più, se ti serve.</p> : null}
      </div>
    </section>
    <section className="clue-answer-panel" aria-label="Rispondi al rebus">
      <span className="round-eyebrow">Il nome dietro le tracce</span>
      <h4>Quale brand si nasconde?</h4>
      <p>{emoji ? 'Leggi le emoji insieme e scrivi il nome del brand.' : 'Collega gli indizi e scrivi il nome del brand.'} Puoi rispondere anche subito.</p>
      <label className="round-answer-label" htmlFor={`${challenge.id}-brand-answer`}>La tua risposta</label>
      <input id={`${challenge.id}-brand-answer`} className="round-text-input" autoComplete="off" spellCheck={false}
        placeholder="Scrivi il nome del brand…" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} />
      <div className="clue-points"><strong>{points}</strong><span>{points === 1 ? 'punto descrittivo' : 'punti descrittivi'}<small>se indovini adesso · non sono crediti</small></span></div>
      <button className="round-confirm" disabled={disabled || !value.trim()} type="submit">Conferma risposta <span aria-hidden="true">→</span></button>
      <small className="round-final-note">La conferma è definitiva per questo round.</small>
    </section>
  </div>
}
