import { useState } from 'react'
import TypewriterText from '../home/TypewriterText.jsx'

function MusicChallengeIntro({ character, introText, onComplete }) {
  const [isDone, setIsDone] = useState(false)

  if (!character) {
    onComplete?.()
    return null
  }

  const resolvedIntroText = introText || 'La prova ti aspetta.'
  const isSilver = character.tone === 'silver'
  const accentBorder = isSilver ? 'border-stone-300/30' : 'border-amber-300/30'
  const accentBg = isSilver ? 'bg-stone-900/95' : 'bg-amber-950/95'
  const accentGlow = isSilver
    ? 'shadow-[0_0_50px_rgba(180,180,180,0.07)]'
    : 'shadow-[0_0_50px_rgba(212,175,55,0.10)]'
  const nameColor = isSilver ? 'text-stone-200' : 'text-amber-200'
  const accentLine = isSilver ? 'bg-stone-400/40' : 'bg-amber-300/40'

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Portrait — outside/above the speech box, like CharacterPanel */}
      <div className="flex flex-col items-center gap-2">
        {character.imageSrc ? (
          <div
            className="overflow-hidden rounded-[1.15rem] border border-white/12 shrink-0"
            style={{ width: '6.5rem', height: '9rem' }}
          >
            <img
              alt={character.name}
              className="h-full w-full object-cover object-top"
              src={character.imageSrc}
            />
          </div>
        ) : (
          <div className="flex h-28 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl font-bold text-white">
            {character.name?.charAt(0) ?? '?'}
          </div>
        )}
        <div className="flex flex-col items-center gap-0.5 text-center">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-white/45">
            {character.role}
          </p>
          <p className={['text-[0.68rem] font-semibold uppercase tracking-[0.22em]', nameColor].join(' ')}>
            {character.name}
          </p>
        </div>
      </div>

      {/* Speech box — separate card below portrait */}
      <div
        className={[
          'w-full overflow-hidden rounded-[2rem] border backdrop-blur-xl px-5 py-5 sm:px-6 sm:py-6',
          accentBorder, accentBg, accentGlow,
        ].join(' ')}
      >
        <div className={['mb-3 h-px w-10', accentLine].join(' ')} />
        <TypewriterText
          alignment="left"
          className="text-sm leading-6 text-white/90 italic"
          isActive={true}
          isComplete={isDone}
          onComplete={() => setIsDone(true)}
          text={resolvedIntroText}
        />

        <div
          className={[
            'mt-5 transition-all duration-500',
            isDone ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
          ].join(' ')}
        >
          <button
            className="rounded-full border border-amber-300/40 bg-amber-400/12 px-6 py-3 text-sm font-semibold text-amber-50 transition hover:border-amber-200/60 hover:bg-amber-400/20"
            onClick={onComplete}
            type="button"
          >
            Inizia la prova →
          </button>
        </div>
      </div>
    </div>
  )
}

export default MusicChallengeIntro
