import { useState } from 'react'
import { usePlayerState } from '../hooks/usePlayerState'

function PlayerSyncNotice() {
  const { syncError, hasSyncConflict, flushPlayerState } = usePlayerState()
  const [retrying, setRetrying] = useState(false)
  if (!syncError) return null

  async function retry() {
    setRetrying(true)
    try { await flushPlayerState() } finally { setRetrying(false) }
  }

  return <aside role="alert" className="fixed inset-x-3 top-3 z-[100] mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300/50 bg-slate-950 p-4 text-sm text-rose-100 shadow-xl">
    <p className="min-w-0 flex-1">{syncError}</p>
    <button className="rounded-xl border border-rose-200/40 px-4 py-2 font-semibold disabled:opacity-50" disabled={retrying} type="button" onClick={hasSyncConflict ? () => window.location.reload() : retry}>
      {hasSyncConflict ? 'Ricarica il gioco' : retrying ? 'Salvataggio…' : 'Riprova salvataggio'}
    </button>
  </aside>
}

export default PlayerSyncNotice
