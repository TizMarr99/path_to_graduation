import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { test } from 'node:test'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { countVisualTimelinePlacements, resolveQuizRounds, observationPhase, canSubmitVisualChallenge, reconcileVisualTimelineOrder } from '../src/lib/visualChallengeRules.js'
import { createInitialDraftAnswerForChallenge, createChallengeRuntimeState } from '../src/lib/challengeDraftState.js'

const room = JSON.parse(readFileSync(new URL('../src/data/categories/cura-corpo.json', import.meta.url)))
const game = (id) => room.challenges.find((challenge) => challenge.id === id)
const timeline = game('cc-hitster-style-01')

test('both 1970 permutations score 7; wrong periods and duplicate items do not', () => {
  const order = [...timeline.correctOrder]
  assert.equal(countVisualTimelinePlacements(order, timeline.correctOrder, timeline.items, true), 7)
  ;[order[3], order[4]] = [order[4], order[3]]
  assert.equal(countVisualTimelinePlacements(order, timeline.correctOrder, timeline.items, true), 7)
  assert.equal(countVisualTimelinePlacements(order, timeline.correctOrder, timeline.items, false), 5)
  ;[order[0], order[1]] = [order[1], order[0]]
  assert.equal(countVisualTimelinePlacements(order, timeline.correctOrder, timeline.items, true), 5)
  order[4] = order[3]
  assert.equal(countVisualTimelinePlacements(order, timeline.correctOrder, timeline.items, true), 4)
})

test('legacy timeline order reconciles valid IDs, removes duplicates and appends new looks', () => {
  const order = reconcileVisualTimelineOrder(['power-1980', 'flapper-1920', 'flapper-1920'], timeline.initialOrder)
  assert.equal(order[0], 'flapper-1920')
  assert.equal(order.length, 7)
  assert.deepEqual(new Set(order), new Set(timeline.correctOrder))
})

test('dupe sides, captions, correct answers and refresh agree; legacy layouts remain A', () => {
  const challenge = game('cc-dupe-original-01')
  const draft = createInitialDraftAnswerForChallenge(challenge)
  const displayed = resolveQuizRounds(challenge, draft)
  assert.deepEqual(displayed.map((round) => round.correctChoiceId), ['a', 'b', 'a', 'b', 'a'])
  for (const [index, round] of displayed.entries()) {
    assert.deepEqual(round.assets.map((asset) => asset.caption), ['A', 'B'])
    assert.equal(round.assets[round.correctChoiceId === 'a' ? 0 : 1].src, challenge.rounds[index].assets[0].src)
  }
  assert.deepEqual(resolveQuizRounds(challenge, JSON.parse(JSON.stringify(draft))), displayed)
  assert.ok(resolveQuizRounds(challenge, {}).every((round) => round.correctChoiceId === 'a'))
})

test('observation deadlines survive snapshots; submission stays closed before expiry', () => {
  const challenge = { type: 'multi_round_quiz', rounds: [{ id: 'detail', displaySeconds: 8 }] }
  const state = JSON.parse(JSON.stringify(createChallengeRuntimeState({ observationDeadlines: { detail: 9000 } })))
  assert.equal(observationPhase(undefined, 1000), 'unseen')
  assert.equal(canSubmitVisualChallenge(challenge, {}, 1000), false)
  assert.equal(canSubmitVisualChallenge(challenge, state, 8999), false)
  assert.equal(canSubmitVisualChallenge(challenge, state, 9000), true)
  assert.equal(observationPhase(state.observationDeadlines.detail, 10000), 'answering')
  assert.equal(canSubmitVisualChallenge({ ...challenge, contentStatus: 'pending' }, state, 10000), false)
})

test('all connected approved media exist and exclude originals/reserves; stable challenge IDs remain', () => {
  assert.equal(room.challenges.length, 18)
  assert.equal(new Set(room.challenges.map((challenge) => challenge.id)).size, 18)
  assert.equal(room.mapHotspots.length, 5)
  for (const challenge of room.challenges) {
    assert.ok(room.mapHotspots.some((zone) => zone.id === challenge.zoneId))
    if (!['ready'].includes(challenge.contentStatus) && challenge.id !== 'cc-photo-filters-01') continue
    for (const part of challenge.items ?? challenge.rounds ?? []) {
      for (const asset of part.assets ?? []) {
        assert.ok(existsSync(new URL(`../public${asset.src}`, import.meta.url)), asset.src)
        assert.doesNotMatch(asset.src, /originali|riserve/)
      }
    }
  }
})

test('normalized evaluator respects ties, optional bonus, outfit 6/7 and dupe 3/5 boundaries', async () => {
  const server = await createServer({ configFile: false, plugins: [react()], server: { middlewareMode: true }, appType: 'custom' })
  try {
    const data = await server.ssrLoadModule('/src/lib/challengeData.js')
    const { evaluateChallenge } = await server.ssrLoadModule('/src/lib/challengeRegistry.js')
    const category = data.getCategoryById('cura-corpo')
    const evaluate = (challenge, draftAnswer) => evaluateChallenge({ challenge, draftAnswer, category, challengeState: createChallengeRuntimeState() })
    const normalizedTimeline = category.challenges.find((item) => item.id === timeline.id)
    const draft = createInitialDraftAnswerForChallenge(normalizedTimeline)
    draft.visualTimelineOrderIds = [...normalizedTimeline.correctOrder]
    ;[draft.visualTimelineOrderIds[3], draft.visualTimelineOrderIds[4]] = [draft.visualTimelineOrderIds[4], draft.visualTimelineOrderIds[3]]
    assert.equal(evaluate(normalizedTimeline, draft).scoreEarned, 7)
    const before = evaluate(normalizedTimeline, draft)
    draft.visualTimelineStyleAnswers = Object.fromEntries(normalizedTimeline.items.map((item) => [item.id, item.acceptedStyleAnswers[0]]))
    const after = evaluate(normalizedTimeline, draft)
    assert.equal(after.scoreEarned, before.scoreEarned)
    assert.equal(after.metadata.optionalStyleBonus, 7)
    assert.equal(after.isCorrect, before.isCorrect)
    for (const [id, field, threshold] of [['cc-iconic-outfits-01', 'imageOptionSelections', 6], ['cc-dupe-original-01', 'multiRoundAnswers', 3]]) {
      const challenge = category.challenges.find((item) => item.id === id)
      const answer = createInitialDraftAnswerForChallenge(challenge)
      const parts = field === 'multiRoundAnswers' ? resolveQuizRounds(challenge, answer) : challenge.items
      for (const count of [threshold - 1, threshold]) {
        answer[field] = Object.fromEntries(parts.map((part, index) => [part.id, index < count ? part.correctOptionId ?? part.correctChoiceId : 'wrong']))
        assert.equal(evaluate(challenge, answer).isCorrect, count === threshold)
      }
    }
  } finally {
    await server.close()
  }
})
