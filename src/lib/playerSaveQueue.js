import { buildDailyPayload, buildProgressPayload } from './playerStateSnapshot.js'

/** Serialize snapshots and retry an ambiguous failure with the same receipt ID.
 * Session generations prevent an old response from affecting a later login.
 */
export function createPlayerSaveQueue({ save, onSaved, onError, onSyncing }) {
  let queue = Promise.resolve()
  let code = ''
  let revision = 0
  let generation = 0
  let failedPacket = null
  let blocked = false
  const acknowledged = new Set()
  const archived = new Set()

  return {
    reset(nextCode, nextRevision) {
      generation += 1
      code = nextCode
      revision = nextRevision
      failedPacket = null
      blocked = false
      acknowledged.clear()
      archived.clear()
      onSyncing(false)
    },
    get blocked() { return blocked },
    get hasFailedPacket() { return Boolean(failedPacket) },
    wait() { return queue },
    enqueue(state, { silent = false } = {}) {
      const sessionCode = code
      const sessionGeneration = generation
      const isCurrent = () => sessionGeneration === generation && sessionCode === code
      const run = async () => {
        if (!sessionCode || !isCurrent() || blocked) return { ok: false }
        if (!silent) onSyncing(true)
        onError(null)
        async function send(packet) {
          const snapshot = await save(sessionCode, packet.progress, packet.daily)
          if (!isCurrent()) return false
          revision = snapshot.progress.state_revision
          for (const movement of packet.progress.credit_movements) acknowledged.add(movement.id)
          for (const id of packet.archiveIds) archived.add(id)
          onSaved(snapshot, acknowledged, archived)
          return true
        }
        try {
          if (failedPacket) {
            if (!await send(failedPacket)) return { ok: false }
            failedPacket = null
          }
          const archives = (state._roomArchives ?? []).filter((row) => !archived.has(row.id))
          const packet = {
            progress: {
              ...buildProgressPayload(state), state_revision: revision, save_id: crypto.randomUUID(),
              credit_movements: (state._creditMovements ?? []).filter((row) => !acknowledged.has(row.id)),
              archives: archives.map((row) => ({ category_id: row.categoryId, ...row.archive })),
            },
            daily: buildDailyPayload(state), archiveIds: archives.map((row) => row.id),
          }
          failedPacket = packet
          if (!await send(packet)) return { ok: false }
          failedPacket = null
          return { ok: true }
        } catch (error) {
          if (!isCurrent()) return { ok: false }
          if (error?.message === 'STALE_STATE') { blocked = true; failedPacket = null }
          onError(error)
          return { ok: false, error }
        } finally { if (!silent && isCurrent()) onSyncing(false) }
      }
      const result = queue.then(run, run)
      queue = result
      return result
    },
  }
}
