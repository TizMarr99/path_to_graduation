import { useEffect, useRef, useState } from 'react'
import TypewriterText from '../home/TypewriterText.jsx'
import '../home/vip-home.css'
import { useBackgroundAudio } from '../../hooks/useBackgroundAudio'
import { usePlayerState } from '../../hooks/usePlayerState'
import { getRoomCharacterBySpeaker, getRoomNarrativeBySpeaker } from '../../lib/roomSpeakers'

const CROSSFADE_DURATION_MS = 700

function NarrativePortrait({ character }) {
  const [src, setSrc] = useState(character.imageSrc)
  const silver = character.tone === 'silver'

  return (
    <div className="room-narrative-portrait flex items-center gap-4 sm:flex-col sm:text-center">
      <div className={`room-narrative-photo shrink-0 overflow-hidden rounded-2xl border bg-black/30 ${silver ? 'border-stone-300/20' : 'border-amber-300/25'}`}>
        <img
          alt={character.name}
          className="h-full w-full object-contain object-top"
          src={src}
          style={{ objectPosition: character.portraitObjectPosition || 'center top' }}
          onError={() => {
            if (character.fallbackImageSrc && src !== character.fallbackImageSrc) setSrc(character.fallbackImageSrc)
          }}
        />
      </div>
      <div>
        <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.25em] ${silver ? 'text-stone-300' : 'text-amber-200/80'}`}>
          {character.role}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-amber-50 sm:mt-2 sm:text-2xl">{character.name}</h2>
      </div>
    </div>
  )
}

function MusicRoomNarrative({ category, onComplete }) {
  const timeoutIdsRef = useRef([])
  const [scene, setScene] = useState('guardian')
  const { isMusicEnabled } = usePlayerState()

  useBackgroundAudio(
    { src: category.ambientAudioSrc || '/audio/bg_music_room.mp3', volume: 0.15 },
    isMusicEnabled,
  )

  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current
    return () => timeoutIds.forEach((id) => clearTimeout(id))
  }, [])

  function scheduleTimeout(callback, delay) {
    const id = setTimeout(callback, delay)
    timeoutIdsRef.current.push(id)
  }

  function handleGuardianComplete() {
    if (scene !== 'guardian') return
    setScene('guardian-complete')
  }

  function handleInquisitorComplete() {
    if (scene === 'inquisitor') setScene('inquisitor-complete')
  }

  const isGuardian = scene === 'guardian' || scene === 'guardian-complete' || scene === 'guardian-leaving'
  const speaker = isGuardian ? 'guardian' : 'inquisitor'
  const character = getRoomCharacterBySpeaker(category.characters, speaker)
  const message = getRoomNarrativeBySpeaker(category.introNarrative, speaker)?.message ?? ''
  const isComplete = scene === 'inquisitor-complete'

  return (
    <section className="room-narrative relative h-full overflow-hidden text-amber-50" aria-label={`Introduzione: ${category.title}`}>
      {category.backgroundImage ? (
        <img alt="" className="absolute inset-0 h-full w-full object-cover" src={category.backgroundImage} />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.65)_0%,rgba(0,0,0,0.35)_40%,rgba(0,0,0,0.75)_100%)]" />

      <div className="room-narrative-layout relative mx-auto grid h-full max-w-6xl grid-rows-[auto_minmax(0,1fr)_auto] gap-4 px-4 pt-4 sm:gap-5 sm:px-7 sm:pt-6">
        <header className="room-narrative-heading">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-amber-200/75 sm:text-xs">
            {category.title}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            {category.introHeadline ?? 'Le frequenze ti accolgono.'}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-50/75">
            {category.introLead ?? "Il guardiano custodisce il passaggio, l'inquisitore ne mette alla prova il coraggio."}
          </p>
        </header>

        <div className={`room-narrative-scene grid min-h-0 gap-4 transition-opacity duration-700 sm:grid-cols-[minmax(8rem,14rem)_minmax(0,1fr)] sm:items-center sm:gap-8 ${scene === 'guardian-leaving' ? 'opacity-0' : 'opacity-100'}`}>
          {character ? <NarrativePortrait key={character.id ?? speaker} character={character} /> : null}
          <div className={`flex min-h-0 max-h-full flex-col overflow-hidden rounded-3xl border bg-black/75 p-4 backdrop-blur-xl sm:p-6 ${isGuardian ? 'border-amber-300/25' : 'border-stone-300/25'}`}>
            <TypewriterText
              key={speaker}
              alignment="left"
              className="flex min-h-0 flex-col text-sm leading-6 text-stone-100 sm:text-base sm:leading-7 lg:text-lg lg:leading-8"
              contentClassName="min-h-0 overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]"
              isActive={scene !== 'guardian-leaving'}
              isComplete={scene === 'guardian-complete' || scene === 'guardian-leaving' || isComplete}
              onComplete={isGuardian ? handleGuardianComplete : handleInquisitorComplete}
              text={message}
            />
          </div>
        </div>

        <footer className="flex shrink-0 justify-center pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:justify-end sm:pb-5 sm:pr-44">
          <button
            className={`min-h-12 w-full rounded-full border px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-300/40 sm:w-auto ${isComplete ? 'border-amber-300/55 bg-amber-300/15 text-amber-50 hover:bg-amber-300/25' : 'border-slate-500/50 bg-slate-950/75 text-slate-200 hover:border-slate-300'}`}
            disabled={scene === 'guardian-leaving'}
            onClick={() => {
              if (scene === 'guardian-complete') {
                setScene('guardian-leaving')
                scheduleTimeout(() => setScene('inquisitor'), CROSSFADE_DURATION_MS)
              } else {
                onComplete()
              }
            }}
            type="button"
          >
            {isComplete ? 'Inizia i Quiz' : scene === 'guardian-complete' || scene === 'guardian-leaving' ? 'Continua' : 'Salta intro'}
          </button>
        </footer>
      </div>
    </section>
  )
}

export default MusicRoomNarrative
