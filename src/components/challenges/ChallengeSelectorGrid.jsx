import { Link } from 'react-router-dom'
import { challengeTypeLabels } from '../../lib/challengeRegistry'

function resolveChallengeTitle(challenge) {
  return challenge.title || challengeTypeLabels[challenge.type] || challenge.type
}

function ChallengeSelectorGrid({
  category,
  currentChallengeId,
  resolvedChallengeIds = [],
  interactiveMode = 'button',
  interactionDisabled = false,
  onSelect,
}) {
  const resolvedSet = new Set(resolvedChallengeIds)

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {category.challenges.map((challenge, index) => {
        const isActive = challenge.id === currentChallengeId
        const isResolved = resolvedSet.has(challenge.id)
        const className = [
          'relative flex min-h-28 flex-col justify-between overflow-hidden rounded-2xl border px-4 py-4 text-left transition',
          isActive
            ? 'border-amber-300/60 bg-amber-300/12 text-amber-50 shadow-[0_0_24px_rgba(252,211,77,0.12)]'
            : isResolved
              ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-50'
              : 'border-slate-800 bg-slate-900/70 text-slate-100 hover:border-cyan-300/40 hover:bg-slate-900/90',
          interactionDisabled ? 'cursor-not-allowed opacity-55 saturate-0 hover:border-slate-800 hover:bg-slate-900/70' : '',
        ].join(' ')
        const content = (
          <>
            {interactionDisabled ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/55 backdrop-blur-[2px]">
                <span className="rounded-full border border-slate-600 bg-slate-900/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Bloccato
                </span>
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/45 text-lg font-semibold">
                {index + 1}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold leading-6">{resolveChallengeTitle(challenge)}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300/80">
                {challenge.prompt}
              </p>
            </div>
          </>
        )

        if (interactiveMode === 'link') {
          if (interactionDisabled) {
            return (
              <div key={challenge.id} className={className}>
                {content}
              </div>
            )
          }

          return (
            <Link
              key={challenge.id}
              className={className}
              to={`/play/${category.id}?challenge=${challenge.id}`}
            >
              {content}
            </Link>
          )
        }

        return (
          <button
            key={challenge.id}
            className={className}
            disabled={interactionDisabled}
            onClick={() => onSelect?.(challenge.id)}
            type="button"
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}

export default ChallengeSelectorGrid