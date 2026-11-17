import assert from 'node:assert/strict'
import test from 'node:test'
import { createPlayerSaveQueue } from '../src/lib/playerSaveQueue.js'
import { createDefaultPlayerState } from '../src/lib/playerStateSnapshot.js'

const movement = (id, delta) => ({ id, delta, kind: delta > 0 ? 'challenge_reward' : 'hint', label: id })
const stateWith = (credits, rows = [], archives = []) => ({ ...createDefaultPlayerState(), credits, _creditMovements: rows, _roomArchives: archives })

function harness(save) {
  const committed = []
  const errors = []
  const syncing = []
  const queue = createPlayerSaveQueue({ save, onSaved: (snapshot) => committed.push(snapshot), onError: (error) => errors.push(error), onSyncing: (value) => syncing.push(value) })
  queue.reset('test-code', 0)
  return { queue, committed, errors, syncing }
}

test('concurrent saves serialize revisions and include each movement once', async () => {
  const calls = []
  const { queue } = harness(async (code, progress) => {
    calls.push({ code, progress })
    await Promise.resolve()
    return { progress: { state_revision: calls.length } }
  })
  const a = movement('reward', 30)
  const b = movement('hint', -10)
  const first = queue.enqueue(stateWith(30, [a]))
  const second = queue.enqueue(stateWith(20, [a, b]))
  assert.equal((await first).ok, true)
  assert.equal((await second).ok, true)
  assert.deepEqual(calls.map((call) => call.progress.state_revision), [0, 1])
  assert.deepEqual(calls.map((call) => call.progress.credit_movements.map((row) => row.id)), [['reward'], ['hint']])
  assert.deepEqual(calls.map((call) => call.progress.credits), [30, 20])
})

test('a lost response retries the identical receipt before a later snapshot', async () => {
  const calls = []
  const { queue } = harness(async (code, progress) => {
    calls.push(progress)
    if (calls.length === 1) throw new Error('network response lost after commit')
    return { progress: { state_revision: calls.length === 2 ? 1 : 2 } }
  })
  const a = movement('reward', 30)
  const b = movement('hint', -10)
  assert.equal((await queue.enqueue(stateWith(30, [a]))).ok, false)
  assert.equal((await queue.enqueue(stateWith(20, [a, b]))).ok, true)
  assert.equal(calls[0].save_id, calls[1].save_id)
  assert.deepEqual(calls[0], calls[1])
  assert.deepEqual(calls[2].credit_movements.map((row) => row.id), ['hint'])
  assert.equal(calls[2].state_revision, 1)
})

test('a stale revision blocks queued writes until the session is reloaded', async () => {
  let calls = 0
  const { queue, errors } = harness(async () => {
    calls += 1
    throw new Error('STALE_STATE')
  })
  const first = queue.enqueue(stateWith(10, [movement('a', 10)]))
  const second = queue.enqueue(stateWith(20, [movement('a', 10), movement('b', 10)]))
  await Promise.all([first, second])
  assert.equal(calls, 1)
  assert.equal(queue.blocked, true)
  assert.equal(errors.at(-1).message, 'STALE_STATE')
  queue.reset('test-code', 8)
  assert.equal(queue.blocked, false)
})

test('responses and queued snapshots from a previous login cannot affect the next session', async () => {
  let finish
  const calls = []
  const { queue, committed } = harness(async (code, progress) => {
    calls.push({ code, progress })
    if (calls.length === 1) return new Promise((resolve) => { finish = resolve })
    return { progress: { state_revision: 10 } }
  })
  const first = queue.enqueue(stateWith(10, [movement('old-a', 10)]))
  const queued = queue.enqueue(stateWith(20, [movement('old-a', 10), movement('old-b', 10)]))
  await Promise.resolve()
  queue.reset('new-code', 9)
  const next = queue.enqueue(stateWith(50))
  finish({ progress: { state_revision: 1 } })
  await Promise.all([first, queued, next])
  assert.equal(calls.length, 2)
  assert.equal(calls[1].code, 'new-code')
  assert.equal(calls[1].progress.state_revision, 9)
  assert.equal(committed.length, 1)
  assert.equal(committed[0].progress.state_revision, 10)
})

test('archive and summary are saved in the same request, and the archive is acknowledged once', async () => {
  const calls = []
  const { queue } = harness(async (code, progress) => {
    calls.push(progress)
    return { progress: { state_revision: calls.length } }
  })
  const archive = { id: 'archive-packet', categoryId: 'musica', archive: { summary: { correctCount: 8 }, completed_snapshot: { challengeResults: {} } } }
  const state = stateWith(20, [], [archive])
  await queue.enqueue(state)
  await queue.enqueue(state)
  assert.equal(calls[0].archives[0].category_id, 'musica')
  assert.equal(calls[0].archives[0].summary.correctCount, 8)
  assert.deepEqual(calls[1].archives, [])
})
