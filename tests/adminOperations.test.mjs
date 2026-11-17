import assert from 'node:assert/strict'
import test from 'node:test'
import { buildAdminPlan, finalizeAdminPlan, getAdminGames, getResettableRounds, isOwnAdminProfile } from '../src/lib/adminOperations.js'

const challenges = [
  { id: 'a', type: 'multiple_choice', title: 'A', quizSubType: 'group-a' },
  { id: 'b', type: 'multiple_choice', title: 'B', quizSubType: 'group-a' },
  { id: 'c', type: 'memory_palette', title: 'Palette', contentVersion: 2, quizSubType: 'palette', rounds: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }] },
]
const categories = [{ id: 'musica', title: 'Musica', challenges: [] }, { id: 'cura-corpo', title: 'Corpo', challenges }]

function fixture() {
  const session = {
    categoryId: 'cura-corpo', currentChallengeId: 'c',
    challengeResults: { a: { isCorrect: true }, b: { isCorrect: false }, c: { isCorrect: true } },
    draftAnswersByChallengeId: {
      c: { lockedRounds: { r1: { isCorrect: true }, r2: {}, r3: {} }, roundCursor: 3,
        memoryPaletteSelections: { r1: ['red'], r2: ['blue'], r3: ['green'] } },
    },
    challengeStatesByChallengeId: { c: { observationDeadlines: { r1: 100, r2: 200, r3: 300 } } },
    sessionCorrectCount: 2, sessionWrongCount: 1,
  }
  return {
    snapshot: { role: 'player', progress: {
      credits: 100, state_revision: 7, unlocked_category_ids: ['musica', 'cura-corpo', 'serie-film'],
      room_progress: { 'cura-corpo': { startedAt: 123, prizeWon: true, archiveAvailable: true }, 'serie-film': { prizeWon: true } },
      active_session: null, transition_state: { pendingBridge: { sourceCategoryId: 'cura-corpo', targetCategoryId: 'next' } },
      email_state: { sent: true }, reward_state: { gift: true },
    }, daily_limits: { attempts_remaining: 1, lives_remaining: 0 } },
    archives: [{ category_id: 'cura-corpo', completed_snapshot: session, summary: {} }],
    leaves: [
      { id: 'reward', root_id: 'reward', is_effective: true, kind: 'challenge_reward', delta: 30, category_id: 'cura-corpo', challenge_id: 'c' },
      { id: 'hint', root_id: 'hint', is_effective: true, kind: 'hint', delta: -10, category_id: 'cura-corpo', challenge_id: 'c' },
      { id: 'other', root_id: 'other', is_effective: true, kind: 'challenge_reward', delta: 20, category_id: 'serie-film' },
      { id: 'void', root_id: 'old', is_effective: false, kind: 'challenge_reward', delta: -40, category_id: 'cura-corpo', challenge_id: 'c' },
      { id: 'opening', root_id: 'opening', is_effective: false, kind: 'opening', delta: 60 },
    ],
  }
}

test('room reset preserves other rooms, clears archive/session/transition, and proposes exact outstanding amounts', () => {
  const context = fixture()
  const original = structuredClone(context)
  const plan = buildAdminPlan(context, categories, { operation: 'room', categoryId: 'cura-corpo', replayIntro: true, access: 'locked' })
  assert.deepEqual(context, original)
  assert.equal(plan.progress.room_progress['cura-corpo'].prizeWon, false)
  assert.equal(plan.progress.room_progress['serie-film'].prizeWon, true)
  assert.equal(plan.progress.room_progress['cura-corpo'].introSeen, false)
  assert.equal(plan.progress.unlocked_category_ids.includes('cura-corpo'), false)
  assert.equal(plan.archives.length, 0)
  assert.equal(plan.progress.transition_state.pendingBridge, null)
  assert.deepEqual(plan.moneyLines.map((line) => line.defaultDelta), [-30, 10])
  assert.deepEqual(plan.moneyLines.flatMap((line) => line.source_ids), ['reward', 'hint'])
  const payload = finalizeAdminPlan(plan, ['-25', '8'], 'Domande aggiornate', 'request')
  assert.equal(payload.progress.credits, 83)
  assert.equal(payload.money_lines[0].defaultDelta, -30)
  assert.equal(payload.expected_revision, 7)
})

test('game reset removes the whole scoring group, retaining all other input and results', () => {
  const context = fixture()
  const plan = buildAdminPlan(context, categories, { operation: 'game', categoryId: 'cura-corpo', gameId: 'group-a' })
  assert.deepEqual(Object.keys(plan.progress.active_session.challengeResults), ['c'])
  assert.equal(plan.progress.active_session.currentChallengeId, 'a')
  assert.equal(plan.progress.active_session.sessionCorrectCount, 1)
  assert.equal(plan.progress.active_session.sessionWrongCount, 0)
  assert.equal(plan.progress.room_progress['cura-corpo'].lastOutcomeSummary, null)
  assert.deepEqual(getAdminGames(categories[1])[0].challenges.map((item) => item.id), ['a', 'b'])
})

test('a room purchase is refunded by default only when access is revoked', () => {
  const context = fixture()
  context.leaves.push({ id: 'purchase', root_id: 'purchase', is_effective: true, kind: 'room_access', delta: -50, category_id: 'cura-corpo' })
  const keep = buildAdminPlan(context, categories, { operation: 'room', categoryId: 'cura-corpo', access: 'keep' })
  const relock = buildAdminPlan(context, categories, { operation: 'room', categoryId: 'cura-corpo', access: 'locked' })
  assert.equal(keep.moneyLines[1].defaultDelta, 10)
  assert.equal(relock.moneyLines[1].defaultDelta, 60)
  const access = buildAdminPlan(context, categories, { operation: 'access', categoryId: 'cura-corpo', access: 'locked' })
  assert.equal(access.moneyLines[0].defaultDelta, 50)
})

test('round reset retains preceding rounds and removes later answers, locks and timers', () => {
  const plan = buildAdminPlan(fixture(), categories, { operation: 'round', categoryId: 'cura-corpo', gameId: 'palette', challengeId: 'c', roundId: 'r2' })
  const session = plan.progress.active_session
  assert.deepEqual(Object.keys(session.challengeResults), ['a', 'b'])
  assert.equal(session.draftAnswersByChallengeId.c.roundCursor, 1)
  assert.deepEqual(Object.keys(session.draftAnswersByChallengeId.c.lockedRounds), ['r1'])
  assert.deepEqual(session.draftAnswersByChallengeId.c.memoryPaletteSelections, { r1: ['red'] })
  assert.deepEqual(session.challengeStatesByChallengeId.c.observationDeadlines, { r1: 100 })
  assert.equal(session.sessionCorrectCount, 1)
  assert.equal(session.sessionWrongCount, 1)
  assert.deepEqual(plan.moneyLines.map((line) => line.defaultDelta), [-30, 10])
  assert.equal(getResettableRounds({ ...challenges[2], simultaneousRounds: true }).length, 0)
})

test('complete reset reaches zero including pre-ledger balance while preserving the previous state', () => {
  const context = fixture()
  const plan = buildAdminPlan(context, categories, { operation: 'profile' })
  const payload = finalizeAdminPlan(plan, [], 'Ripartenza completa', 'request')
  assert.equal(payload.progress.credits, 0)
  assert.deepEqual(payload.progress.unlocked_category_ids, ['musica'])
  assert.deepEqual(payload.progress.room_progress, {})
  assert.deepEqual(payload.daily, { attempts_remaining: 3, lives_remaining: 2 })
  assert.deepEqual(context.snapshot.progress.email_state, { sent: true })
})

test('snapshot restore aligns financial roots and restores archives and day limits', () => {
  const context = fixture()
  const before = structuredClone(context)
  before.snapshot.progress.credits = 70
  before.leaves = before.leaves.filter((row) => row.id !== 'reward')
  const plan = buildAdminPlan(context, categories, { operation: 'restore' }, { id: 'checkpoint', title: 'Intervento precedente', before_state: before })
  assert.deepEqual(plan.moneyLines[0].source_ids, ['reward'])
  assert.equal(plan.moneyLines[0].defaultDelta, -30)
  assert.equal(finalizeAdminPlan(plan, [], 'Ripristino', 'request').progress.credits, 70)
  assert.equal(plan.archives.length, 1)
})

test('invalid or conflicting plans cannot silently overwrite unrelated sessions or create negative balances', () => {
  const context = fixture()
  assert.throws(() => buildAdminPlan(context, categories, { operation: 'access', categoryId: 'musica', access: 'locked' }), /iniziale/)
  assert.throws(() => buildAdminPlan(context, categories, { operation: 'round', categoryId: 'cura-corpo', gameId: 'palette', challengeId: 'c', roundId: 'missing' }), /round valido/)
  const plan = buildAdminPlan(context, categories, { operation: 'credits', creditDelta: -101 })
  assert.throws(() => finalizeAdminPlan(plan, [], 'Motivo', 'request'), /negativo/)
  assert.throws(() => finalizeAdminPlan(plan, ['1.5'], 'Motivo', 'request'), /interi/)
  assert.throws(() => finalizeAdminPlan(plan, [''], 'Motivo', 'request'), /Compila/)
  assert.throws(() => finalizeAdminPlan(plan, ['0'], ' ', 'request'), /motivo/)
  context.snapshot.progress.active_session = { categoryId: 'musica' }
  assert.throws(() => buildAdminPlan(context, categories, { operation: 'game', categoryId: 'cura-corpo', gameId: 'group-a' }), /altra stanza/)
})

test('only the logged-in administrator’s own profile permits an automatic reason', () => {
  const plan = buildAdminPlan(fixture(), categories, { operation: 'credits', creditDelta: 0 })
  const own = { actorCode: 'admin-test', targetCode: 'admin-test' }
  const other = { actorCode: 'admin-test', targetCode: 'player-test' }
  assert.equal(isOwnAdminProfile('', ''), false)
  assert.equal(isOwnAdminProfile('admin-test', undefined), false)
  assert.equal(isOwnAdminProfile(' admin-test ', 'admin-test'), true)
  assert.equal(finalizeAdminPlan(plan, ['0'], '  ', 'self', own).reason, 'Intervento sul proprio profilo')
  assert.equal(finalizeAdminPlan(plan, ['0'], ' Nota personale ', 'self-note', own).reason, 'Nota personale')
  assert.throws(() => finalizeAdminPlan(plan, ['0'], ' ', 'other', other), /motivo/)
  assert.throws(() => finalizeAdminPlan(plan, ['0'], '', 'missing', { actorCode: '', targetCode: '' }), /motivo/)
  assert.equal(finalizeAdminPlan(plan, ['0'], ' Correzione richiesta ', 'other-note', other).reason, 'Correzione richiesta')
})
