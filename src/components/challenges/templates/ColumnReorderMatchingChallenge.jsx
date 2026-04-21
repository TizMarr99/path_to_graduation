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

  const cellsById = new Map(challenge.cells.map((cell) => [cell.id, cell]))

  function handleSwap(colIndex, sourceRow, targetRow) {
    if (lockedColumns.includes(colIndex)) return
    if (sourceRow === targetRow) return

    const nextColumnOrders = columnOrders.map((col, ci) => {
      if (ci !== colIndex) return [...col]
      const next = [...col]
      const temp = next[sourceRow]
      next[sourceRow] = next[targetRow]
      next[targetRow] = temp
      return next
    })

    onDraftAnswerChange({ columnOrders: nextColumnOrders })
  }

  function scrollColumns(direction) {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({
      left: direction * 280,
      behavior: 'smooth',
    })
  }

  function handleMoveUp(colIndex, rowIndex) {
    if (rowIndex <= 0) return
    handleSwap(colIndex, rowIndex, rowIndex - 1)
  }

  function handleMoveDown(colIndex, rowIndex) {
    if (rowIndex >= (columnOrders[colIndex]?.length ?? 0) - 1) return
    handleSwap(colIndex, rowIndex, rowIndex + 1)
  }

  function handleDragStart(colIndex, rowIndex) {
    setDragState({ colIndex, rowIndex })
  }

  function handleDrop(colIndex, rowIndex) {
    if (!dragState || dragState.colIndex !== colIndex) {
      setDragState(null)
      return
    }
    handleSwap(colIndex, dragState.rowIndex, rowIndex)
    setDragState(null)
  }

  function handleBonusNameChange(rowId, value) {
    onDraftAnswerChange({
      columnBonusNames: { ...bonusNames, [rowId]: value },
    })
  }

  function resolveBonusRowForColumn(colIndex) {
    const firstCellId = columnOrders[colIndex]?.[0]
    if (!firstCellId) return null
    return challenge.rows.find((row) => row.correctOrder[colIndex] === firstCellId) ?? null
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-300">
          Riordina le immagini in ogni colonna in modo che ogni riga corrisponda
          allo stesso soggetto. Servono almeno {challenge.minimumCorrectRows} righe
          corrette.
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
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${challenge.columns.length}, minmax(170px, 1fr))`,
            }}
          >
            {challenge.columns.map((colLabel, colIndex) => (
              <div
                key={colLabel}
                className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80"
              >
                {colLabel}
                {lockedColumns.includes(colIndex) ? (
                  <span className="ml-2 rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] tracking-[0.12em] text-amber-200">
                    BLOCCATA
                  </span>
                ) : null}
              </div>
            ))}

            {Array.from({ length: challenge.rows.length }, (_, rowIndex) => (
              <>
                {challenge.columns.map((_, colIndex) => {
                  const cellId = columnOrders[colIndex]?.[rowIndex]
                  const cell = cellId ? cellsById.get(cellId) : null
                  const isLockedColumn = lockedColumns.includes(colIndex)

                  return (
                    <div
                      key={`col-${colIndex}-row-${rowIndex}`}
                      className={[
                        'rounded-xl border border-dashed p-2 transition',
                        cell
                          ? 'border-cyan-300/25 bg-cyan-400/5'
                          : 'border-slate-700 bg-slate-900/40',
                        isLockedColumn ? 'opacity-85' : '',
                      ].join(' ')}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(colIndex, rowIndex)}
                    >
                      {cell ? (
                        <div
                          className="cursor-grab space-y-1 active:cursor-grabbing"
                          draggable={!disabled && !isLockedColumn}
                          onDragStart={() => handleDragStart(colIndex, rowIndex)}
                        >
                          <ChallengeAssetGallery assets={cell.assets} />

                          <div className="flex justify-center gap-1">
                            <button
                              className="rounded px-1.5 py-0.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40"
                              disabled={disabled || isLockedColumn || rowIndex <= 0}
                              onClick={() => handleMoveUp(colIndex, rowIndex)}
                              type="button"
                            >
                              ↑
                            </button>
                            <button
                              className="rounded px-1.5 py-0.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40"
                              disabled={
                                disabled ||
                                isLockedColumn ||
                                rowIndex >= (columnOrders[colIndex]?.length ?? 0) - 1
                              }
                              onClick={() => handleMoveDown(colIndex, rowIndex)}
                              type="button"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-20 items-center justify-center text-xs text-slate-500">
                          —
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ))}

            {hasBonusNameField
              ? challenge.columns.map((_, colIndex) => {
                  const bonusRow = resolveBonusRowForColumn(colIndex)
                  return (
                    <div key={`bonus-col-${colIndex}`} className="space-y-1">
                      <p className="text-center text-[10px] uppercase tracking-[0.2em] text-amber-300/70">
                        Nome bonus
                      </p>
                      <input
                        autoComplete="off"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/50 focus:ring-1 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={disabled || !bonusRow}
                        onChange={(e) =>
                          handleBonusNameChange(bonusRow?.id ?? `col-${colIndex}`, e.target.value)
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

      <ChallengeSubmitButton disabled={disabled || !hasAnyMove} />
    </form>
  )
}

export default ColumnReorderMatchingChallenge
