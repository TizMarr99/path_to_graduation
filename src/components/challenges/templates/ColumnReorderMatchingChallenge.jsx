import { useRef, useState } from 'react'
import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function ColumnReorderMatchingChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onSubmit,
  disabled,
}) {
  const columnOrders = draftAnswer.columnOrders ?? []
  const bonusNames = draftAnswer.columnBonusNames ?? {}
  const [dragState, setDragState] = useState(null)
  const scrollContainerRef = useRef(null)
  const hasBonusNameField = challenge.rows.some(
    (row) => row.bonusNameAcceptedAnswers?.length > 0,
  )
  const lockedColumns = challenge.lockedColumns ?? []
  const hasAnyMove = columnOrders.some((col) => col.length > 0)
  const laneCount = Math.max(challenge.rows.length, ...columnOrders.map((col) => col.length))

  const cellsById = new Map(challenge.cells.map((cell) => [cell.id, cell]))

  function handleSwap(stageIndex, sourceIndex, targetIndex) {
    if (lockedColumns.includes(stageIndex)) return
    if (sourceIndex === targetIndex) return

    const nextColumnOrders = columnOrders.map((col, ci) => {
      if (ci !== stageIndex) return [...col]
      const next = [...col]
      const temp = next[sourceIndex]
      next[sourceIndex] = next[targetIndex]
      next[targetIndex] = temp
      return next
    })

    onDraftAnswerChange({ columnOrders: nextColumnOrders })
  }

  function scrollColumns(direction) {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({
      left: direction * 320,
      behavior: 'smooth',
    })
  }

  function handleMoveLeft(stageIndex, laneIndex) {
    if (laneIndex <= 0) return
    handleSwap(stageIndex, laneIndex, laneIndex - 1)
  }

  function handleMoveRight(stageIndex, laneIndex) {
    if (laneIndex >= (columnOrders[stageIndex]?.length ?? 0) - 1) return
    handleSwap(stageIndex, laneIndex, laneIndex + 1)
  }

  function handleDragStart(stageIndex, laneIndex) {
    setDragState({ stageIndex, laneIndex })
  }

  function handleDrop(stageIndex, laneIndex) {
    if (!dragState || dragState.stageIndex !== stageIndex) {
      setDragState(null)
      return
    }
    handleSwap(stageIndex, dragState.laneIndex, laneIndex)
    setDragState(null)
  }

  function handleBonusNameChange(rowId, value) {
    onDraftAnswerChange({
      columnBonusNames: { ...bonusNames, [rowId]: value },
    })
  }

  function resolveBonusRowForLane(laneIndex) {
    for (let stageIndex = 0; stageIndex < challenge.columns.length; stageIndex += 1) {
      const cellId = columnOrders[stageIndex]?.[laneIndex]
      if (!cellId) continue

      const matchingRow = challenge.rows.find((row) => row.correctOrder[stageIndex] === cellId)
      if (matchingRow) {
        return matchingRow
      }
    }

    return null
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-300">
          Riordina gli slot orizzontalmente finché ogni colonna rappresenta lo stesso soggetto. Servono almeno {challenge.minimumCorrectRows} colonne corrette.
        </p>

        <div className="mb-2 flex items-center justify-end gap-2">
          <button
            className="rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            onClick={() => scrollColumns(-1)}
            type="button"
          >
            ←
          </button>
          <button
            className="rounded-lg border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            onClick={() => scrollColumns(1)}
            type="button"
          >
            →
          </button>
        </div>

        <div className="overflow-x-auto" ref={scrollContainerRef}>
          <div className="min-w-max space-y-3">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `160px repeat(${laneCount}, minmax(132px, 160px))` }}
            >
              <div />
              {Array.from({ length: laneCount }, (_, laneIndex) => (
                <div
                  key={`lane-${laneIndex}`}
                  className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80"
                >
                  {hasBonusNameField ? `Slot ${laneIndex + 1}` : `Coppia ${laneIndex + 1}`}
                </div>
              ))}

              {challenge.columns.map((colLabel, stageIndex) => {
                const isLockedColumn = lockedColumns.includes(stageIndex)

                return [
                  <div
                    key={`label-${colLabel}`}
                    className="flex items-center justify-end pr-2 text-right text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80"
                  >
                    <div>
                      {colLabel}
                      {isLockedColumn ? (
                        <span className="ml-2 rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] tracking-[0.12em] text-amber-200">
                          BLOCCATA
                        </span>
                      ) : null}
                    </div>
                  </div>,
                  ...Array.from({ length: laneCount }, (_, laneIndex) => {
                    const cellId = columnOrders[stageIndex]?.[laneIndex] ?? ''
                    const cell = cellId ? cellsById.get(cellId) : null
                    const hasAssets = Boolean(cell?.assets?.length)

                    return (
                      <div
                        key={`stage-${stageIndex}-lane-${laneIndex}`}
                        className={[
                          'rounded-xl border border-dashed p-2 transition',
                          cell ? 'border-cyan-300/25 bg-cyan-400/5' : 'border-slate-700 bg-slate-900/40',
                          isLockedColumn ? 'opacity-85' : '',
                        ].join(' ')}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop(stageIndex, laneIndex)}
                      >
                        <div
                          className="space-y-2"
                          draggable={!disabled && !isLockedColumn && Boolean(cellId)}
                          onDragStart={() => handleDragStart(stageIndex, laneIndex)}
                        >
                          {hasAssets ? (
                            <ChallengeAssetGallery
                              assets={cell.assets}
                              imageClassName="h-28 rounded-xl bg-slate-950 object-contain"
                            />
                          ) : (
                            <div className="flex h-28 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/90 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                              Non disponibile
                            </div>
                          )}

                          <div className="flex justify-center gap-1">
                            <button
                              className="rounded px-1.5 py-0.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40"
                              disabled={disabled || isLockedColumn || laneIndex <= 0 || !cellId}
                              onClick={() => handleMoveLeft(stageIndex, laneIndex)}
                              type="button"
                            >
                              ←
                            </button>
                            <button
                              className="rounded px-1.5 py-0.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40"
                              disabled={
                                disabled ||
                                isLockedColumn ||
                                laneIndex >= (columnOrders[stageIndex]?.length ?? 0) - 1 ||
                                !cellId
                              }
                              onClick={() => handleMoveRight(stageIndex, laneIndex)}
                              type="button"
                            >
                              →
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }),
                ]
              })}

              {hasBonusNameField ? (
                <div className="flex items-center justify-end pr-2 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-300/70">
                  Nome bonus
                </div>
              ) : null}
              {hasBonusNameField
                ? Array.from({ length: laneCount }, (_, laneIndex) => {
                    const bonusRow = resolveBonusRowForLane(laneIndex)
                    return (
                      <div key={`bonus-lane-${laneIndex}`} className="space-y-1">
                        <input
                          autoComplete="off"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50 focus:ring-1 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={disabled || !bonusRow}
                          onChange={(event) =>
                            handleBonusNameChange(bonusRow?.id ?? `lane-${laneIndex}`, event.target.value)
                          }
                          placeholder="Nome"
                          type="text"
                          value={bonusRow ? bonusNames[bonusRow.id] ?? '' : ''}
                        />
                      </div>
                    )
                  })
                : null}
            </div>
          </div>
        </div>
      </div>

      <ChallengeSubmitButton disabled={disabled || !hasAnyMove} />
    </form>
  )
}

export default ColumnReorderMatchingChallenge
