import { useState } from 'react'
import ChallengeAssetGallery from '../common/ChallengeAssetGallery.jsx'
import ChallengeSubmitButton from '../common/ChallengeSubmitButton.jsx'

function ImageOptionMatchingChallenge({
  challenge,
  draftAnswer,
  onDraftAnswerChange,
  onSubmit,
  disabled,
}) {
  const selections = draftAnswer.imageOptionSelections ?? {}
  const hasAnySelection = Object.values(selections).some(Boolean)
  const isGotMatching = challenge.quizSubType === 'got_matching'
  const isStrangerThingsMatching = challenge.quizSubType === 'st_matching'
  const sourceEntriesById = new Map(challenge.options.map((option) => [option.id, option]))
  const itemsById = new Map(challenge.items.map((item) => [item.id, item]))
  const sourceEntries = draftAnswer.imageOptionSourceOrderIds?.length
    ? draftAnswer.imageOptionSourceOrderIds
      .map((optionId) => sourceEntriesById.get(optionId))
      .filter(Boolean)
    : challenge.options
  const sourceLabelsById = new Map(
    sourceEntries.map((entry, index) => [
      entry.id,
      isStrangerThingsMatching ? `Traccia ${index + 1}` : entry.label,
    ]),
  )
  const orderedItems = draftAnswer.imageOptionItemOrderIds?.length
    ? draftAnswer.imageOptionItemOrderIds
      .map((itemId) => itemsById.get(itemId))
      .filter(Boolean)
    : challenge.items
  const [activeSourceId, setActiveSourceId] = useState('')

  function getNextUnassignedSourceId(nextSelections = selections) {
    const assignedOptionIds = new Set(Object.values(nextSelections))
    return challenge.options.find((option) => !assignedOptionIds.has(option.id))?.id ?? ''
  }
  const effectiveActiveSourceId = sourceEntries.some((entry) => entry.id === activeSourceId)
    ? activeSourceId
    : getNextUnassignedSourceId()

  function commitSelections(nextSelections) {
    onDraftAnswerChange({
      imageOptionSelections: nextSelections,
    })
  }

  function handleAssignToItem(itemId) {
    if (disabled || !effectiveActiveSourceId) return

    const nextSelections = Object.entries(selections).reduce((accumulator, [selectedItemId, optionId]) => {
      if (selectedItemId !== itemId && optionId === effectiveActiveSourceId) {
        return accumulator
      }

      accumulator[selectedItemId] = optionId
      return accumulator
    }, {})

    nextSelections[itemId] = effectiveActiveSourceId
    commitSelections(nextSelections)
    setActiveSourceId(getNextUnassignedSourceId(nextSelections))
  }

  function clearItemAssignment(itemId) {
    if (disabled || !selections[itemId]) return

    const nextSelections = { ...selections }
    delete nextSelections[itemId]
    commitSelections(nextSelections)
    setActiveSourceId(selections[itemId])
  }

  function renderSourceEntry(entry) {
    const isActive = effectiveActiveSourceId === entry.id
    const isAssigned = Object.values(selections).includes(entry.id)
    const sourceLabel = sourceLabelsById.get(entry.id) ?? entry.label

    return (
      <button
        key={entry.id}
        className={[
          'w-full rounded-2xl border text-left transition',
          isActive
            ? 'border-cyan-300/55 bg-cyan-400/14 text-cyan-50'
            : 'border-slate-700 bg-slate-950/70 text-slate-200 hover:border-slate-500',
          disabled ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
        disabled={disabled}
        onClick={() => setActiveSourceId(entry.id)}
        type="button"
      >
        <div className="space-y-2 px-3 py-3">
          {entry.icon ? (
            <img
              alt={sourceLabel}
              className="h-28 w-full rounded-xl bg-slate-950 object-contain sm:h-32"
              src={entry.icon}
            />
          ) : null}
          {sourceLabel ? <p className="text-sm font-semibold leading-5">{sourceLabel}</p> : null}
          {entry.assets?.some((asset) => asset.kind === 'audio') ? (
            <div
              className={[
                'rounded-xl border border-slate-800 bg-slate-900/85 px-2 py-2',
                isStrangerThingsMatching ? 'px-1.5 py-1.5' : 'p-3',
              ].join(' ')}
              onClick={(event) => event.stopPropagation()}
            >
              {entry.assets.map((asset, index) =>
                asset.kind === 'audio' ? (
                  <audio
                    key={asset.id ?? `${entry.id}-audio-${index}`}
                    className={isStrangerThingsMatching ? 'block h-8 w-full' : 'block h-10 w-full'}
                    controls
                    preload="metadata"
                    src={asset.src}
                    style={isStrangerThingsMatching ? { height: '2rem' } : undefined}
                  />
                ) : null,
              )}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-end px-3 pb-3">
          {isAssigned ? (
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
              assegnato
            </span>
          ) : null}
        </div>
      </button>
    )
  }

  function renderGotTarget(item) {
    const assignedOption = challenge.options.find((currentOption) => currentOption.id === selections[item.id])

    return (
      <button
        key={item.id}
        className={[
          'space-y-3 rounded-2xl border px-4 py-4 text-left transition',
          assignedOption
            ? 'border-cyan-300/40 bg-cyan-400/10'
            : 'border-slate-800 bg-slate-900/70 hover:border-slate-600',
          effectiveActiveSourceId ? 'cursor-pointer' : 'cursor-default',
          disabled ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
        disabled={disabled}
        onClick={() => handleAssignToItem(item.id)}
        type="button"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">{item.label}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              {assignedOption?.label ?? 'Seleziona uno stemma e clicca qui'}
            </p>
          </div>
          {assignedOption ? (
            <span
              className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100"
              onClick={(event) => {
                event.stopPropagation()
                clearItemAssignment(item.id)
              }}
              role="button"
              tabIndex={0}
            >
              rimuovi
            </span>
          ) : null}
        </div>
      </button>
    )
  }

  function renderStTarget(item) {
    const assignedOption = challenge.options.find((option) => option.id === selections[item.id])
    const assignedOptionLabel = assignedOption
      ? (sourceLabelsById.get(assignedOption.id) ?? assignedOption.label)
      : ''

    return (
      <button
        key={item.id}
        className={[
          'space-y-3 rounded-2xl border px-4 py-4 text-left transition',
          assignedOption
            ? 'border-cyan-300/40 bg-cyan-400/10'
            : 'border-slate-800 bg-slate-900/70 hover:border-slate-600',
          effectiveActiveSourceId ? 'cursor-pointer' : 'cursor-default',
          disabled ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
        disabled={disabled}
        onClick={() => handleAssignToItem(item.id)}
        type="button"
      >
        <ChallengeAssetGallery assets={item.assets} imageClassName="h-40 rounded-xl bg-slate-950 object-contain sm:h-48" />
        <div className="flex items-start justify-between gap-3">
          <div>
            {item.label ? <p className="text-sm font-semibold text-slate-100">{item.label}</p> : null}
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              {assignedOptionLabel || 'Seleziona una traccia e clicca qui'}
            </p>
          </div>
          {assignedOption ? (
            <span
              className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100"
              onClick={(event) => {
                event.stopPropagation()
                clearItemAssignment(item.id)
              }}
              role="button"
              tabIndex={0}
            >
              rimuovi
            </span>
          ) : null}
        </div>
      </button>
    )
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-300">
          Seleziona un elemento dalla lista e poi clicca sul riquadro corrispondente per assegnarlo. Servono almeno{' '}
          {challenge.minimumCorrectPairs} abbinamenti corretti.
        </p>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
              {isGotMatching ? 'Stemmi da assegnare' : 'Tracce da assegnare'}
            </p>
            {effectiveActiveSourceId ? (
              <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                selezione attiva
              </span>
            ) : null}
          </div>

          <div className={[
            'grid gap-3',
            isStrangerThingsMatching ? 'md:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 xl:grid-cols-3',
          ].join(' ')}>
            {sourceEntries.map((entry) => renderSourceEntry(entry))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isGotMatching
            ? orderedItems.map((item) => renderGotTarget(item))
            : orderedItems.map((item) => renderStTarget(item))}
        </div>
      </div>

      <ChallengeSubmitButton disabled={disabled || !hasAnySelection} />
    </form>
  )
}

export default ImageOptionMatchingChallenge
