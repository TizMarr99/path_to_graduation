import { useRef, useState } from 'react'

export default function DupeRoundChoices({ challenge, round, value, disabled, onChange }) {
  const dialog = useRef(null)
  const [zoomedAsset, setZoomedAsset] = useState(null)
  return <>
    <div className="dupe-instructions"><span className="dupe-seal" aria-hidden="true">A / B</span><div>
      <h4>Trova l’originale</h4>
      <p>Un prodotto è l’originale di riferimento, l’altro è un dupe: un’alternativa che gli somiglia. Seleziona la foto dell’originale, poi conferma.</p>
    </div></div>
    <fieldset className="dupe-pair" disabled={disabled}>
      <legend className="sr-only">Quale prodotto è l’originale?</legend>
      {(round.assets ?? []).map((asset, i) => {
        // A/B refer to the assets, independently of the shuffled choice order.
        const letter = asset.caption?.trim().toUpperCase() || String.fromCharCode(65 + i)
        const choice = round.choices.find((entry) => entry.text.trim().toUpperCase() === letter)
        if (!choice) return null
        const selected = value === choice.id
        return <article key={choice.id} className={`dupe-card ${selected ? 'is-selected' : ''}`}>
          <label className="dupe-select">
            <input className="sr-only" type="radio" name={`${challenge.id}-${round.id}`} value={choice.id} checked={selected} onChange={() => onChange(choice.id)} />
            <span className="dupe-card-heading"><span className="dupe-letter">{letter}</span><span>{selected ? 'La tua scelta' : 'Candidato originale'}</span><span className="dupe-check" aria-hidden="true">{selected ? '✓' : ''}</span></span>
            <span className="dupe-photo"><img src={asset.src} alt={asset.alt || `Prodotto ${letter}`} /></span>
            <span className="dupe-choice-label">{selected ? `${letter} è la tua scelta` : `Scelgo ${letter} come originale`}</span>
          </label>
          <button className="dupe-zoom" type="button" onClick={() => { setZoomedAsset(asset); dialog.current.showModal() }} aria-label={`Ingrandisci prodotto ${letter}`}><span aria-hidden="true">⌕</span> Ingrandisci</button>
        </article>
      })}
    </fieldset>
    <dialog className="dupe-zoom-dialog" ref={dialog} aria-label="Dettaglio del prodotto">
      <button className="round-reveal" type="button" onClick={() => dialog.current.close()} autoFocus>Chiudi ×</button>
      {zoomedAsset ? <img src={zoomedAsset.src} alt={zoomedAsset.alt || 'Prodotto ingrandito'} /> : null}
    </dialog>
  </>
}
