import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

const capacities = [1, 1, 1, 2, 1, 1]

export default function VisualTimelineChallenge({ challenge, draftAnswer, challengeState,
  onDraftAnswerChange, onChallengeStateChange, onSubmit, disabled }) {
  const byId = new Map(challenge.items.map((item) => [item.id, item]))
  const revealOrder = draftAnswer.visualTimelineOrderIds
  const count = challengeState.visualTimelineRevealedCount ?? 0
  const revealed = revealOrder.slice(0, count).map((id) => byId.get(id)).filter(Boolean)
  const slots = draftAnswer.visualTimelineSlots ?? {}
  const allPlaced = revealed.every((item) => Number.isInteger(slots[item.id]))
  const complete = count === challenge.items.length && allPlaced

  function renderLook(item) {
    const lookNumber = revealOrder.indexOf(item.id) + 1
    return <article key={item.id} className="min-w-0 space-y-3 rounded-xl border border-slate-700 bg-slate-950 p-3">
      <p className="text-sm text-slate-200">Look {lookNumber}</p>
      <ChallengeAssetGallery assets={item.assets.map((a) => ({ ...a, alt: 'Look da collocare', caption: '' }))} />
      <label className="block text-sm text-slate-200">Colloca nella casella
        <select className="mt-2 w-full rounded border border-slate-600 bg-slate-900 p-2" disabled={disabled}
          value={slots[item.id] ?? ''} onChange={(e) => {
            const next = { ...slots }
            if (e.target.value === '') delete next[item.id]
            else next[item.id] = Number(e.target.value)
            onDraftAnswerChange({ visualTimelineSlots: next })
          }}>
          <option value="">Da collocare</option>
          {capacities.map((capacity, slot) => <option key={slot} value={slot}
            disabled={slots[item.id] !== slot && Object.values(slots).filter((v) => v === slot).length >= capacity}>
            {slot + 1}{capacity === 2 ? ' · due look' : ''}
          </option>)}
        </select>
      </label>
    </article>
  }

  return <form className="space-y-5" onSubmit={onSubmit}>
    <h3 className="text-xl font-semibold text-white">{challenge.prompt}</h3>
    <p className="text-slate-300">Servono {challenge.minimumCorrectPlacements} collocazioni corrette su 7. Puoi spostare i look rivelati fino all’invio finale. Fino a {challenge.creditReward} crediti per l’ordinamento, più 14 crediti bonus per nomi e decadi.</p>
    <div className="space-y-4">
      {capacities.map((capacity, slot) => <section key={slot} className="rounded-2xl border border-slate-700 p-4">
        <h4 className="mb-3 text-white">Casella {slot + 1}</h4>
        <div className={capacity === 2 ? 'grid gap-3 sm:grid-cols-2' : ''}>
          {revealed.filter((item) => slots[item.id] === slot).map(renderLook)}
          {Array.from({ length: capacity - revealed.filter((item) => slots[item.id] === slot).length }, (_, i) =>
            <p key={i} className="rounded-xl border border-dashed border-slate-700 p-6 text-slate-400">Spazio per un look</p>)}
        </div>
      </section>)}
    </div>
    {revealed.filter((item) => !Number.isInteger(slots[item.id])).map(renderLook)}
    {count < challenge.items.length ? <button className="rounded-full border border-cyan-300/40 px-5 py-3 text-cyan-100 disabled:opacity-50"
      type="button" disabled={disabled || !allPlaced}
      onClick={() => onChallengeStateChange({ visualTimelineRevealedCount: count + 1 })}>
      Rivela il prossimo look ({count}/{challenge.items.length})
    </button> : null}
    {complete ? <section className="space-y-4 rounded-xl border border-slate-700 p-4">
      <h4 className="text-white">Bonus facoltativi: nomi e decadi</h4>
      <p className="text-sm text-slate-300">+1 credito per nome e +1 per decade corretti, fino a 14 extra anche se la timeline non supera la soglia. I bonus vengono accreditati all’invio finale; la soglia riguarda soltanto la timeline.</p>
      {revealed.map((item) => <div key={item.id} className="space-y-2">
        <p className="text-white">Look {revealOrder.indexOf(item.id) + 1}</p>
        {[['visualTimelineStyleAnswers', 'Nome dello stile o periodo'], ['visualTimelineDecadeAnswers', 'Decade']].map(([field, label]) =>
          <label key={field} className="block text-sm text-slate-300">{label}
            <input className="mt-1 w-full rounded border border-slate-600 bg-slate-950 p-2 text-white"
              autoComplete="off" disabled={disabled} value={draftAnswer[field]?.[item.id] ?? ''}
              onChange={(e) => onDraftAnswerChange({ [field]: { ...draftAnswer[field], [item.id]: e.target.value } })} />
          </label>)}
      </div>)}
    </section> : null}
    <ChallengeSubmitButton disabled={disabled || !complete} />
  </form>
}
