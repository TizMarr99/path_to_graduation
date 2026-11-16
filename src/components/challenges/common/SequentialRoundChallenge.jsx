import TimedObservation from './TimedObservation.jsx'
import ChallengeAssetGallery from './ChallengeAssetGallery.jsx'
import { evaluateVisualRound } from '../../../lib/visualChallengeRules.js'

const buttonClass = 'rounded-full border border-cyan-300/40 px-5 py-3 text-cyan-100 disabled:opacity-50'

/** Round confirmations lock drafts; the existing session pays only at completion. */
export default function SequentialRoundChallenge({ challenge, draftAnswer, challengeState,
  onDraftAnswerChange, onChallengeStateChange, onSubmit, disabled }) {
  const palette = challenge.type === 'memory_palette'
  const progressive = challenge.type === 'progressive_clue_rounds'
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
    onDraftAnswerChange({ lockedRounds: {
      ...draftAnswer.lockedRounds, [round.id]: { answer: value, visibleCount: visible },
    } })
  }

  const question = (
    <div className="space-y-4">
      {round.title ? <h4 className="text-lg font-semibold text-white">{round.title}</h4> : null}
      <p className="text-lg text-white">{round.prompt || 'Quale brand riconosci?'}</p>
      {round.questionNote ? <p className="text-sm text-slate-300">{round.questionNote}</p> : null}
      <ChallengeAssetGallery key={`${round.id}-answer`} assets={round.displaySeconds ? round.answerAssets : round.assets} />
      {progressive ? <div className="space-y-3">
        {round.clues.slice(0, visible).map((clue, i) => (
          <p key={i} className={challenge.quizSubType === 'brand_emoji' ? 'inline-block p-3 text-5xl' : 'rounded-xl border border-slate-700 p-4 text-slate-200'}>{clue}</p>
        ))}
        <p className="text-sm text-slate-300">{Math.max(1, 4 - visible)} punti descrittivi se indovini.</p>
        <button type="button" className={buttonClass} disabled={disabled || visible >= round.clues.length}
          onClick={() => onChallengeStateChange({ progressiveClueVisibleCounts: {
            ...challengeState.progressiveClueVisibleCounts, [round.id]: visible + 1,
          } })}>Altro indizio</button>
      </div> : null}
      {palette || round.mode !== 'free_text' && !progressive ? (
        <fieldset disabled={disabled} className="grid grid-cols-2 gap-3" aria-label="Scegli la risposta">
          {orderedChoices.map((choice, i) => {
            const selected = palette ? value.includes(choice.id) : value === choice.id
            return <label key={choice.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${selected ? 'border-amber-300 bg-amber-300/10' : 'border-slate-700 bg-slate-950'}`}>
              <input type="radio" name={`${challenge.id}-${round.id}`} checked={selected}
                onChange={() => change(palette ? [choice.id] : choice.id)} />
              {choice.colorHex ? <span className="h-16 flex-1 rounded border border-white/25" style={{ backgroundColor: choice.colorHex }} /> : null}
              <span className="text-white">{choice.colorHex ? String.fromCharCode(65 + i) : choice.text}</span>
            </label>
          })}
        </fieldset>
      ) : <label className="block text-slate-200">La tua risposta
        <input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
          autoComplete="off" disabled={disabled} value={value} onChange={(e) => change(e.target.value)} />
      </label>}
      <button className={buttonClass} disabled={disabled || !hasAnswer} type="submit">Conferma risposta</button>
    </div>
  )

  return <form className="space-y-5" onSubmit={locked ? (event) => event.preventDefault() : confirm}>
    <h3 className="text-xl font-semibold text-white">{challenge.prompt}</h3>
    <p className="text-sm text-slate-300">Round {index + 1} di {rounds.length} · Servono {challenge.minimumCorrectRounds} risposte corrette. Le risposte confermate sono definitive.</p>
    {locked ? <div role="status" className="space-y-4 rounded-2xl border border-slate-700 p-5 text-white">
      <p className={result.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>{result.isCorrect ? 'Risposta corretta' : 'Risposta sbagliata'}</p>
      <p>Soluzione: {result.solution}</p>
      <ChallengeAssetGallery key={`${round.id}-solution`} assets={round.solutionAssets} />
      {round.explanation ? <p>{round.explanation}</p> : null}
      {index < rounds.length - 1 ? <button className={buttonClass} type="button" disabled={disabled}
        onClick={() => onDraftAnswerChange({ roundCursor: index + 1 })}>Round successivo</button>
        : <button className={buttonClass} type="button" disabled={disabled} onClick={onSubmit}>Termina prova</button>}
    </div> : round.displaySeconds ? <TimedObservation key={round.id} round={round} challengeState={challengeState}
      onChallengeStateChange={onChallengeStateChange} disabled={disabled}>{question}</TimedObservation> : question}
  </form>
}
