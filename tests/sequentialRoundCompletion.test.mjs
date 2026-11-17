import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement, isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('a completed sequential challenge never reopens the locked last-round dialog', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { default: SequentialRoundChallenge } = await server.ssrLoadModule('/src/components/challenges/common/SequentialRoundChallenge.jsx')
    const props = {
      challenge: {
        id: 'details', type: 'multi_round_quiz', prompt: 'Dettaglio', minimumCorrectRounds: 1,
        rounds: [{ id: 'last', mode: 'free_text', acceptedAnswers: ['oboe'], prompt: 'Strumento?', assets: [] }],
      },
      draftAnswer: { roundCursor: 0, lockedRounds: { last: { answer: 'flauto' } } },
      challengeState: {}, disabled: true, isResolved: true, onReview() {},
    }
    // An open ResultModal would attempt to create a document portal, which
    // cannot render here. This reproduces the persisted locked-round state.
    const html = renderToStaticMarkup(createElement(SequentialRoundChallenge, props))
    assert.match(html, /Prova conclusa/)
    assert.match(html, /Rivedi risultato/)
    assert.doesNotMatch(html, /Termina prova|aria-modal/)

    const active = renderToStaticMarkup(createElement(SequentialRoundChallenge, {
      ...props, isResolved: false, disabled: false, draftAnswer: { lockedRounds: {} },
    }))
    assert.match(active, /Conferma risposta/)
    assert.doesNotMatch(active, /Prova conclusa|Rivedi risultato/)
  } finally { await server.close() }
})

test('last-round Continue submits with immediate advancement and forwards the click event', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { default: SequentialRoundChallenge } = await server.ssrLoadModule('/src/components/challenges/common/SequentialRoundChallenge.jsx')
    const calls = []
    const clickEvent = { preventDefault() { calls.push('preventDefault') } }
    const view = SequentialRoundChallenge({
      challenge: {
        id: 'palette', type: 'memory_palette', prompt: 'Palette', minimumCorrectRounds: 1,
        rounds: [{ id: 'last', correctColorIds: ['green'], colors: [{ id: 'green', name: 'Verde', hex: '#008000' }], assets: [] }],
      },
      draftAnswer: { roundCursor: 0, lockedRounds: { last: { answer: ['green'] } } },
      challengeState: {}, disabled: false,
      onRoundFeedbackClose() { calls.push('closeRound') },
      onSubmit(event, options) {
        // The page handler expects the click/form event before evaluating.
        event.preventDefault()
        assert.equal(event, clickEvent)
        assert.deepEqual(options, { continueToNext: true })
        calls.push('submit')
      },
    })
    const popup = view.props.children.find((child) => isValidElement(child) && child.props.continueLabel === 'Continua')
    assert.ok(popup, 'the locked last round must offer final submission')
    popup.props.onContinue(clickEvent)
    assert.deepEqual(calls, ['closeRound', 'preventDefault', 'submit'])
  } finally { await server.close() }
})

test('submitting and continuing in one click skips the summary and preserves session results', async (t) => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { useChallengeSession } = await server.ssrLoadModule('/src/hooks/useChallengeSession.js')
    const { getCategoryById } = await server.ssrLoadModule('/src/lib/challengeData.js')
    const category = getCategoryById('cura-corpo')
    const palette = category.challenges[0]
    const details = category.challenges[1]

    for (const scenario of [
      { name: 'passed palette opens details', correct: true, completedIds: [], next: details.id },
      { name: 'failed palette also opens details', correct: false, completedIds: [], next: details.id },
      { name: 'completed games are skipped across zones', correct: true, completedIds: [details.id], next: category.challenges[2].id },
      { name: 'last remaining game completes the room', correct: true, completedIds: category.challenges.slice(1).map((c) => c.id), next: null },
    ]) {
      await t.test(scenario.name, () => {
        const answers = Object.fromEntries(palette.rounds.map((round) => [round.id,
          scenario.correct ? round.correctColorIds : ['incorrect-color'],
        ]))
        const persisted = {
          currentChallengeId: palette.id,
          challengeResults: Object.fromEntries(scenario.completedIds.map((id) => [id, { attemptedChallengeId: id, isCorrect: true }])),
          draftAnswersByChallengeId: {
            [palette.id]: {
              contentVersion: 2, roundCursor: palette.rounds.length - 1,
              memoryPaletteSelections: answers,
              lockedRounds: Object.fromEntries(palette.rounds.map((round) => [round.id, { answer: answers[round.id] }])),
            },
          },
          challengeStatesByChallengeId: {
            [palette.id]: { observationDeadlines: Object.fromEntries(palette.rounds.map((round) => [round.id, 1])) },
          },
        }
        let advanced = false
        let nextChallenge
        let session
        function SessionHarness() {
          session = useChallengeSession(category, '', persisted)
          if (!advanced) {
            advanced = true
            const feedback = session.submitChallenge()
            assert.ok(feedback, 'the locked palette must be evaluated')
            assert.equal(feedback.isCorrect, scenario.correct)
            nextChallenge = session.goToNextChallenge({ submittedFeedback: feedback })
          }
          return null
        }
        renderToStaticMarkup(createElement(SessionHarness))
        assert.equal(nextChallenge?.id ?? null, scenario.next)
        assert.equal(session.currentChallengeId, scenario.next ?? palette.id)
        assert.equal(session.hasFeedback, false, 'no aggregate result popup remains open')
        assert.equal(session.isComplete, scenario.next === null)
        assert.equal(session.resolvedChallengeCount, scenario.completedIds.length + 1)
        assert.equal(session.challengeResults[palette.id].isCorrect, scenario.correct)
        assert.deepEqual(session.draftAnswersByChallengeId[palette.id].memoryPaletteSelections, answers)
        if (!scenario.next) assert.equal(session.submitChallenge(), null, 'completion cannot award a second result')
      })
    }
  } finally { await server.close() }
})
