import ChallengeAssetGallery from './ChallengeAssetGallery.jsx'

/** Keep the shared round evaluation and draft; adapt only the question layout. */
export default function CultureRoundQuestion({ challenge, round, choices, value, disabled, onChange }) {
  const open = round.mode === 'free_text'
  const hasImage = round.assets?.some((asset) => asset.kind === 'image')
  const colors = !open && choices.length > 0 && choices.every((choice) => choice.colorHex)
  const hasAnswer = Boolean(value.trim())
  return <div className={`culture-question ${hasImage ? 'has-image' : ''}`}>
    {hasImage ? <section className="culture-evidence" aria-label="Foto da osservare">
      <p className="round-eyebrow">Osserva da vicino</p>
      <ChallengeAssetGallery compact assets={round.assets} imageClassName="culture-photo w-full bg-slate-950 object-contain" />
    </section> : null}
    <section className="culture-answer">
      <p className="round-eyebrow">{open ? 'Riconosci e scrivi' : colors ? 'Scegli il campione' : 'Scegli una risposta'}</p>
      <h4>{round.prompt}</h4>
      {round.questionNote ? <p className="culture-instruction">{round.questionNote}</p> : null}
      <p className="culture-instruction">{open ? 'Scrivi il nome che riconosci nella foto.' : 'Seleziona una sola opzione, poi conferma.'}</p>
      {open ? <label className="round-answer-label block">La tua risposta
        <input className="round-text-input mt-2" autoComplete="off" placeholder="Scrivi la tua risposta…" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} />
      </label> : <fieldset className={`culture-options ${colors ? 'has-colors' : ''}`} disabled={disabled}>
        <legend className="sr-only">{round.prompt}</legend>
        {choices.map((choice, i) => <label key={choice.id} className={`culture-option ${value === choice.id ? 'is-selected' : ''}`}>
          {colors ? <span className="culture-color" aria-hidden="true" style={{ backgroundColor: choice.colorHex }} /> : null}
          <span className="culture-choice-text"><input type="radio" name={`${challenge.id}-${round.id}`} value={choice.id} checked={value === choice.id} onChange={() => onChange(choice.id)} />
            <span>{colors ? `Campione ${String.fromCharCode(65 + i)}` : choice.text}</span></span>
        </label>)}
      </fieldset>}
      <div className="culture-confirmation">
        <p role="status">{hasAnswer ? 'Risposta pronta per la conferma.' : open ? 'Inserisci una risposta per continuare.' : 'Scegli una risposta per continuare.'}</p>
        <button className="round-confirm" type="submit" disabled={disabled || !hasAnswer}>Conferma risposta <span aria-hidden="true">→</span></button>
        <small className="round-final-note">La risposta confermata è definitiva.</small>
      </div>
    </section>
  </div>
}
