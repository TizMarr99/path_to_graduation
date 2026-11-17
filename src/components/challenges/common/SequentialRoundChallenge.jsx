import ResultModal from '../../music-room/ResultModal.jsx'
import TimedObservation from './TimedObservation.jsx'
import ChallengeAssetGallery from './ChallengeAssetGallery.jsx'
import ProgressiveClueBoard from './ProgressiveClueBoard.jsx'
import DupeRoundChoices from './DupeRoundChoices.jsx'
import CultureRoundQuestion from './CultureRoundQuestion.jsx'
import './round-games.css'
import { evaluateVisualRound } from '../../../lib/visualChallengeRules.js'

const buttonClass = 'rounded-full border border-cyan-300/40 px-5 py-3 text-cyan-100 disabled:opacity-50'

/** Round confirmations lock drafts; the existing session pays only at completion. */
export default function SequentialRoundChallenge({ challenge, draftAnswer, challengeState,
  onDraftAnswerChange, onChallengeStateChange, onSubmit, disabled, roundFeedback, onRoundFeedback, onRoundFeedbackClose,
  isResolved = false, onReview }) {
  // Locked rounds persist for review. They must not reopen an intermediate
  // dialog after the parent has already evaluated the entire challenge.
  if (isResolved) {
    return <section className="space-y-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/5 p-5">
      <h3 className="text-xl font-semibold text-white">Prova conclusa</h3>
      <p className="text-sm leading-6 text-slate-300">Le risposte sono state registrate. Puoi consultare il risultato o scegliere un altro gioco dalla mappa.</p>
      {onReview ? <button className={buttonClass} type="button" onClick={onReview}>Rivedi risultato</button> : null}
    </section>
  }
  const palette = challenge.type === 'memory_palette'
  const progressive = challenge.type === 'progressive_clue_rounds'
  const dupe = challenge.quizSubType === 'dupe_original'
  const rounds = challenge.rounds
  const index = Math.min(draftAnswer.roundCursor ?? 0, rounds.length - 1)
  const round = rounds[index]
  const field = palette ? 'memoryPaletteSelections' : progressive ? 'progressiveClueAnswers' : 'multiRoundAnswers'
  const answers = draftAnswer[field] ?? {}
  const locked = draftAnswer.lockedRounds?.[round.id]
  const value = locked ? locked.answer : answers[round.id] ?? (palette ? [] : '')
  const visible = challengeState.progressiveClueVisibleCounts?.[round.id] ?? challenge.initialVisibleClues ?? 1
  const result = locked ? evaluateVisualRound(challenge, round, locked.answer, locked.visibleCount) : null
  const choices = palette ? round.colors.map((color) => ({ id: color.id, colorHex: color.hex })) : round.choices ?? []
  const ids = draftAnswer.roundChoiceOrders?.[round.id] ?? choices.map((c) => c.id)
  const orderedChoices = ids.map((id) => choices.find((c) => c.id === id)).filter(Boolean)
  const hasAnswer = palette ? value.length === round.correctColorIds.length : Boolean(value.trim())

  function change(value) {
    if (disabled || locked) return
    onDraftAnswerChange({ [field]: { ...answers, [round.id]: value } })
  }

  function confirm(event) {
    event.preventDefault()
    if (disabled || locked || !hasAnswer) return
    onRoundFeedback?.(evaluateVisualRound(challenge, round, value, visible).isCorrect)
    onDraftAnswerChange({ lockedRounds: {
      ...draftAnswer.lockedRounds, [round.id]: { answer: value, visibleCount: visible },
    } })
  }

  const question = challenge.quizSubType === 'general_culture' ? <CultureRoundQuestion challenge={challenge} round={round} choices={orderedChoices}
    value={value} disabled={disabled} onChange={change} /> : (
    <div className="space-y-5">
      {!progressive && round.title ? <h4 className="text-lg font-semibold text-white">{round.title}</h4> : null}
      {!progressive ? <p className="text-lg text-white">{round.prompt || 'Quale brand riconosci?'}</p> : null}
      {round.questionNote ? <p className="text-sm text-slate-300">{round.questionNote}</p> : null}
      {!dupe ? <ChallengeAssetGallery key={`${round.id}-answer`} assets={round.displaySeconds ? round.answerAssets : round.assets} /> : null}
      {progressive ? <ProgressiveClueBoard challenge={challenge} round={round} visible={visible} value={value} disabled={disabled}
        onChange={change} onReveal={() => onChallengeStateChange({ progressiveClueVisibleCounts: {
          ...challengeState.progressiveClueVisibleCounts, [round.id]: visible + 1,
        } })} /> : dupe ? <DupeRoundChoices challenge={challenge} round={round} value={value} disabled={disabled} onChange={change} /> : palette || round.mode !== 'free_text' ? (
        <fieldset disabled={disabled} className="round-options" aria-label="Scegli la risposta">
          {orderedChoices.map((choice, i) => {
            const selected = palette ? value.includes(choice.id) : value === choice.id
            return <label key={choice.id} className={`round-option ${selected ? 'is-selected' : ''}`}>
              <input type="radio" name={`${challenge.id}-${round.id}`} checked={selected}
                onChange={() => change(palette ? [choice.id] : choice.id)} />
              {choice.colorHex ? <span className="h-16 flex-1 rounded border border-white/25" style={{ backgroundColor: choice.colorHex }} /> : null}
              <span className="text-white">{choice.colorHex ? String.fromCharCode(65 + i) : choice.text}</span>
            </label>
          })}
        </fieldset>
      ) : <label className="round-answer-label block">La tua risposta
        <input className="round-text-input mt-2"
          autoComplete="off" disabled={disabled} value={value} onChange={(e) => change(e.target.value)} />
      </label>}
      {!progressive ? <div className="round-submit-row">
        <p role="status">{hasAnswer ? dupe ? `Hai scelto ${choices.find((choice) => choice.id === value)?.text} come originale.` : 'Risposta pronta per la conferma.' : dupe ? 'Seleziona il prodotto che ritieni originale.' : 'Scegli o scrivi una risposta per continuare.'}<small>La risposta confermata è definitiva.</small></p>
        <button className="round-confirm" disabled={disabled || !hasAnswer} type="submit">Conferma risposta <span aria-hidden="true">→</span></button>
      </div> : null}
    </div>
  )

  return <form className="sequential-game space-y-5" onSubmit={locked ? (event) => event.preventDefault() : confirm}>
    <header className="round-game-header">
      <div><p className="round-eyebrow">{progressive ? 'Vetrina segreta' : dupe ? 'Occhio all’originale' : 'La tua sfida'}</p>
        <h3 className="text-xl font-semibold text-white sm:text-2xl">{challenge.title || challenge.prompt}</h3>
        <p className="round-game-description">{challenge.prompt}</p></div>
      <div className="round-goal"><strong>{challenge.minimumCorrectRounds}<span> / {rounds.length}</span></strong><small>corrette per superare la prova</small></div>
    </header>
    <div className="round-progress"><span>Round <strong>{index + 1}</strong> di {rounds.length}</span>
      <ol aria-label="Avanzamento dei round">{rounds.map((entry, i) => <li key={entry.id} aria-current={i === index ? 'step' : undefined} className={i === index ? 'is-current' : draftAnswer.lockedRounds?.[entry.id] ? 'is-complete' : ''}><span className="sr-only">Round {i + 1}{draftAnswer.lockedRounds?.[entry.id] ? ', confermato' : ''}</span></li>)}</ol>
    </div>
    {locked ? <ResultModal isOpen={!roundFeedback?.hidden} feedback={{
      isCorrect: result.isCorrect,
      title: result.isCorrect ? 'Risposta corretta' : 'Risposta sbagliata',
      message: `Soluzione: ${result.solution}${round.explanation ? `. ${round.explanation}` : ''}`,
    }} showMetrics={false} disabled={disabled}
      characterComment={roundFeedback?.characterComment}
      spiderImageSrc={roundFeedback?.spiderImageSrc}
      flyingInsectImageSrcs={roundFeedback?.flyingInsectImageSrcs}
      fearEffectKey={roundFeedback?.fearEffectKey}
      continueLabel={index < rounds.length - 1 ? 'Round successivo' : 'Continua'}
      onContinue={(event) => {
        onRoundFeedbackClose?.()
        if (index < rounds.length - 1) onDraftAnswerChange({ roundCursor: index + 1 })
        else onSubmit(event, { continueToNext: true })
      }}>
      <div className="mt-4"><ChallengeAssetGallery key={`${round.id}-solution`} assets={round.solutionAssets} /></div>
    </ResultModal> : round.displaySeconds ? <TimedObservation key={round.id} round={round} challengeState={challengeState}
      onChallengeStateChange={onChallengeStateChange} disabled={disabled}>{question}</TimedObservation> : question}
  </form>
}
