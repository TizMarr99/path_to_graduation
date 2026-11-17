import { useEffect, useRef, useState } from 'react'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'
import './visual-timeline.css'

const capacities = [1, 1, 1, 2, 1, 1]

export default function VisualTimelineChallenge({ challenge, draftAnswer, challengeState,
  onDraftAnswerChange, onChallengeStateChange, onSubmit, disabled }) {
  const [selectedId, setSelectedId] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [zoomedItem, setZoomedItem] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const zoomDialog = useRef(null)
  const deckRef = useRef(null)
  const byId = new Map(challenge.items.map((item) => [item.id, item]))
  const revealOrder = draftAnswer.visualTimelineOrderIds
  const count = challengeState.visualTimelineRevealedCount ?? 0
  const revealed = revealOrder.slice(0, count).map((id) => byId.get(id)).filter(Boolean)
  const slots = draftAnswer.visualTimelineSlots ?? {}
  const hasSlot = (id) => Number.isInteger(slots[id]) && slots[id] >= 0 && slots[id] < capacities.length
  const allPlaced = revealed.every((item) => hasSlot(item.id))
  const placedCount = revealed.filter((item) => hasSlot(item.id)).length
  const complete = count === challenge.items.length && allPlaced
  const selectedItem = revealed.find((item) => item.id === selectedId)

  useEffect(() => {
    const deck = deckRef.current
    const card = deck?.children[count - 1]
    if (card) deck.scrollLeft = Math.max(0, card.offsetLeft + card.offsetWidth - deck.clientWidth)
  }, [count])

  useEffect(() => {
    if (!zoomedItem) return
    const dialog = zoomDialog.current
    dialog.showModal()
    return () => dialog.close()
  }, [zoomedItem])

  function lookNumber(id) {
    return revealOrder.indexOf(id) + 1
  }

  function selectLook(id) {
    if (disabled) return
    setSelectedId(selectedId === id ? null : id)
  }

  function placeLook(id, targetSlot, targetId) {
    if (disabled || !revealed.some((item) => item.id === id)) return
    if (slots[id] === targetSlot) {
      setSelectedId(null)
      return
    }
    const occupants = revealed.filter((item) => slots[item.id] === targetSlot)
    const next = { ...slots }
    // A full position swaps cards; unplaced cards return the displaced card to the deck.
    if (occupants.length >= capacities[targetSlot]) {
      const displacedId = occupants.find((item) => item.id === targetId)?.id ?? occupants[0].id
      if (hasSlot(id)) next[displacedId] = slots[id]
      else delete next[displacedId]
    }
    next[id] = targetSlot
    onDraftAnswerChange({ visualTimelineSlots: next })
    setSelectedId(null)
    setDraggedId(null)
    setAnnouncement(`Look ${lookNumber(id)} collocato nella posizione ${targetSlot + 1}.`)
  }

  function startDrag(event, id) {
    event.dataTransfer.setData('text/plain', id)
    event.dataTransfer.effectAllowed = 'move'
    setDraggedId(id)
    setSelectedId(id)
  }

  function dropLook(event, slot, targetId) {
    event.preventDefault()
    event.stopPropagation()
    placeLook(draggedId || event.dataTransfer.getData('text/plain'), slot, targetId)
  }

  function revealNext() {
    if (disabled || !allPlaced || count >= challenge.items.length) return
    onChallengeStateChange({ visualTimelineRevealedCount: count + 1 })
    setSelectedId(revealOrder[count])
    setAnnouncement(`Look ${count + 1} rivelato. Scegli una posizione sulla timeline.`)
  }

  return <form className="style-hitster space-y-6" onSubmit={onSubmit}>
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-white">Costruisci la tua linea del tempo</h3>
      <p className="text-sm leading-6 text-slate-300">Un look alla volta, dal più antico al più recente. Seleziona una carta qui sopra e tocca una posizione sotto, oppure trascinala sulla timeline. Puoi cambiare l’ordine fino alla conferma.</p>
      <p className="text-xs leading-5 text-slate-400">Servono {challenge.minimumCorrectPlacements} collocazioni corrette su {challenge.items.length}. Fino a {challenge.creditReward} crediti per l’ordine, più 14 bonus per nomi e decadi.</p>
    </div>

    <section className="style-hitster__deck" aria-labelledby="hitster-looks-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 id="hitster-looks-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Le carte stile</h4>
        <span className="text-xs text-slate-400">{count}/{challenge.items.length} rivelate · {placedCount} collocate</span>
      </div>
      <div ref={deckRef} className="style-hitster__cards">
        {revealOrder.map((id, index) => {
          const item = index < count ? byId.get(id) : null
          if (!item) return <div key={id} className="style-hitster__unrevealed" aria-label={`Look ${index + 1} ancora da rivelare`}>
            <span className="text-3xl font-light text-slate-600" aria-hidden="true">?</span>
            <span className="text-xs text-slate-500">Look {index + 1}</span>
          </div>
          return <article key={id} className={`style-hitster__card ${selectedId === id ? 'is-selected' : ''}`}
            draggable={!disabled} onDragStart={(event) => startDrag(event, id)} onDragEnd={() => setDraggedId(null)}>
            <button type="button" className="style-hitster__pick" disabled={disabled}
              aria-label={`Seleziona look ${index + 1}`} aria-pressed={selectedId === id} onClick={() => selectLook(id)}>
              <img src={item.assets[0]?.src} alt={`Look ${index + 1} da collocare`} draggable={false} />
              <span className="style-hitster__card-name">Look {index + 1}</span>
              <span className="style-hitster__placement">{hasSlot(id) ? `Posizione ${slots[id] + 1}` : 'Da collocare'}</span>
            </button>
            <button type="button" className="style-hitster__zoom" aria-label={`Ingrandisci look ${index + 1}`}
              onClick={() => setZoomedItem(item)}>Ingrandisci <span aria-hidden="true">↗</span></button>
          </article>
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-cyan-100" role="status">{selectedItem
          ? `Look ${lookNumber(selectedId)} selezionato: scegli dove collocarlo.`
          : count === 0 ? 'Rivela la prima carta per iniziare.' : 'Seleziona una carta per collocarla o spostarla.'}</p>
        {count < challenge.items.length ? <button className="style-hitster__reveal" type="button"
          disabled={disabled || !allPlaced} onClick={revealNext}>
          {count === 0 ? 'Rivela il primo look' : `Rivela il prossimo look (${count}/${challenge.items.length})`} <span aria-hidden="true">＋</span>
        </button> : <span className="text-xs text-emerald-200">Tutte le carte rivelate</span>}
      </div>
      {!allPlaced && count < challenge.items.length ? <p className="mt-2 text-xs text-slate-400">Colloca le carte rivelate per scoprire la prossima.</p> : null}
    </section>

    <section className="style-hitster__board" aria-labelledby="hitster-timeline-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h4 id="hitster-timeline-heading" className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">La tua timeline</h4>
        <span className="text-xs text-slate-400">La posizione 4 accoglie due stili contemporanei</span>
      </div>
      <div className="style-hitster__direction"><span>Più antico</span><span className="style-hitster__arrow" aria-hidden="true" /><span>Più recente</span></div>
      <p className="mb-2 text-xs text-slate-400 sm:hidden">Scorri la timeline verso destra per vedere tutte le posizioni →</p>
      <div className="style-hitster__scroll" tabIndex={0} role="region" aria-label="Timeline orizzontale, dal più antico al più recente">
        <ol className="style-hitster__timeline">
          {capacities.map((capacity, slot) => {
            const occupants = revealed.filter((item) => slots[item.id] === slot)
            return <li key={slot} className={`style-hitster__position ${capacity === 2 ? 'style-hitster__position--double' : ''}`}
              onDragOver={(event) => { if (!disabled) event.preventDefault() }} onDrop={(event) => dropLook(event, slot)}>
              <div className="style-hitster__marker"><span>{slot + 1}</span></div>
              <p className="style-hitster__era">{capacity === 2 ? 'Stessa epoca · 2 look' : `Posizione ${slot + 1}`}</p>
              <div className="style-hitster__spaces">
                {occupants.map((item) => <button key={item.id} type="button" className={`style-hitster__placed ${selectedId === item.id ? 'is-selected' : ''}`}
                  disabled={disabled} draggable={!disabled}
                  aria-label={selectedItem && selectedId !== item.id ? `Scambia look ${lookNumber(selectedId)} con look ${lookNumber(item.id)} nella posizione ${slot + 1}` : `Seleziona look ${lookNumber(item.id)} nella posizione ${slot + 1}`}
                  aria-pressed={selectedId === item.id}
                  onClick={() => selectedItem && selectedId !== item.id ? placeLook(selectedId, slot, item.id) : selectLook(item.id)}
                  onDragStart={(event) => startDrag(event, item.id)} onDragEnd={() => setDraggedId(null)}
                  onDrop={(event) => dropLook(event, slot, item.id)}>
                  <img src={item.assets[0]?.src} alt={`Look ${lookNumber(item.id)}`} draggable={false} />
                  <span>Look {lookNumber(item.id)}</span>
                </button>)}
                {Array.from({ length: Math.max(0, capacity - occupants.length) }, (_, index) => <button key={`empty-${index}`} type="button"
                  className="style-hitster__empty" disabled={disabled || !selectedItem}
                  aria-label={`Colloca il look selezionato nella posizione ${slot + 1}${capacity === 2 ? `, spazio ${occupants.length + index + 1}` : ''}`}
                  onClick={() => placeLook(selectedId, slot)}>
                  <span className="text-2xl font-light" aria-hidden="true">＋</span><span>{selectedItem ? 'Colloca qui' : 'Spazio libero'}</span>
                </button>)}
              </div>
            </li>
          })}
        </ol>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-400">Da sinistra a destra, in ordine temporale. Se una posizione è occupata, tocca la carta per scambiarla con quella selezionata.</p>
    </section>
    <p className="sr-only" aria-live="polite">{announcement}</p>

    {complete ? <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-4 sm:p-5">
      <h4 className="font-semibold text-white">Bonus facoltativi: nomi e decadi</h4>
      <p className="text-sm text-slate-300">+1 credito per nome e +1 per decade corretti, fino a 14 extra anche se la timeline non supera la soglia. I bonus vengono accreditati all’invio finale; la soglia riguarda soltanto la timeline.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {revealed.map((item) => <div key={item.id} className="space-y-2 rounded-xl border border-slate-800 p-3">
          <p className="font-semibold text-white">Look {lookNumber(item.id)}</p>
          { [['visualTimelineStyleAnswers', 'Nome dello stile o periodo'], ['visualTimelineDecadeAnswers', 'Decade']].map(([field, label]) =>
            <label key={field} className="block text-sm text-slate-300">{label}
              <input className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 p-2 text-base text-white"
                autoComplete="off" disabled={disabled} value={draftAnswer[field]?.[item.id] ?? ''}
                onChange={(event) => onDraftAnswerChange({ [field]: { ...draftAnswer[field], [item.id]: event.target.value } })} />
            </label>)}
        </div>)}
      </div>
    </section> : null}
    <ChallengeSubmitButton disabled={disabled || !complete} />

    {zoomedItem ? <dialog ref={zoomDialog} className="style-hitster__dialog" onClose={() => setZoomedItem(null)} aria-label={`Look ${lookNumber(zoomedItem.id)} ingrandito`}>
      <div className="flex items-center justify-between gap-4 pb-3">
        <p className="font-semibold">Look {lookNumber(zoomedItem.id)}</p>
        <button type="button" autoFocus className="rounded-full border border-slate-600 px-4 py-2" onClick={() => setZoomedItem(null)}>Chiudi</button>
      </div>
      <img src={zoomedItem.assets[0]?.src} alt={`Look ${lookNumber(zoomedItem.id)} ingrandito`} />
    </dialog> : null}
  </form>
}
