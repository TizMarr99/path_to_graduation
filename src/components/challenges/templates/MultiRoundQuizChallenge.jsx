import SequentialRoundChallenge from '../common/SequentialRoundChallenge.jsx'
import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'

export default function MultiRoundQuizChallenge(props) {
  const { challenge, draftAnswer, onDraftAnswerChange, onSubmit, disabled } = props
  if (!challenge.simultaneousRounds) return <SequentialRoundChallenge {...props} />
  const answers = draftAnswer.multiRoundAnswers ?? {}
  const answerFor = (round) => answers[round.id] ?? draftAnswer.lockedRounds?.[round.id]?.answer ?? ''
  const completedCount = challenge.rounds.filter((round) => answerFor(round).trim()).length
  function renderAnswer(round, index) {
    return <label className="round-answer-label block">
      {challenge.quizSubType === 'photo_filters' ? 'Effetto' : challenge.quizSubType === 'iconic_outfits' ? 'Personaggio' : 'Prodotto'} {index + 1}
      <input className="round-text-input mt-2"
        autoComplete="off" value={answerFor(round)} disabled={disabled}
        onChange={(event) => onDraftAnswerChange({ multiRoundAnswers: { ...answers, [round.id]: event.target.value } })} />
    </label>
  }
  return <form className="round-gallery-game space-y-5" onSubmit={onSubmit}>
    <header className="round-game-header">
      <div><p className="round-eyebrow">Osserva · riconosci · rispondi</p><h3 className="text-xl font-semibold text-white sm:text-2xl">{challenge.title}</h3><p className="round-game-description">{challenge.prompt}</p></div>
      <div className="round-goal"><strong>{challenge.minimumCorrectRounds}<span> / {challenge.rounds.length}</span></strong><small>corrette per superare la prova</small></div>
    </header>
    {challenge.assets?.length ? <section className="space-y-2 rounded-2xl border border-cyan-300/25 p-4">
      <h4 className="text-sm font-semibold text-cyan-100">Immagine originale di riferimento</h4>
      <ChallengeAssetGallery assets={challenge.assets} />
    </section> : null}
    <p className="text-sm text-slate-300">Ingrandisci le foto e compila le risposte. Puoi modificarle tutte prima della conferma finale.</p>
    <div className="round-photo-grid">
      {challenge.rounds.map((round, i) => <article key={round.id} className={`round-photo-card ${answerFor(round).trim() ? 'is-filled' : ''}`}>
        <div className="round-section-heading"><span className="round-eyebrow">Scatto {String(i + 1).padStart(2, '0')}</span><span className="round-counter">{answerFor(round).trim() ? 'Compilato' : 'Da riconoscere'}</span></div>
        <ChallengeAssetGallery compact assets={round.assets} zoomContent={renderAnswer(round, i)} imageClassName="h-40 w-full bg-slate-950 object-contain sm:h-48" />
        {renderAnswer(round, i)}
      </article>)}
    </div>
    <div className="round-submit-row"><p role="status">{completedCount} di {challenge.rounds.length} risposte compilate.<small>Puoi modificarle tutte prima della conferma finale.</small></p>
      <button className="round-confirm" type="submit" disabled={disabled || completedCount < challenge.rounds.length}>Conferma tutte le risposte <span aria-hidden="true">→</span></button>
    </div>
  </form>
}
