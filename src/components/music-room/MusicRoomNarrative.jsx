import { useEffect, useRef, useState } from 'react'
import TypewriterText from '../home/TypewriterText.jsx'
import '../../components/home/vip-home.css'
import { useBackgroundAudio } from '../../hooks/useBackgroundAudio'
import { getRoomCharacterBySpeaker, getRoomNarrativeBySpeaker } from '../../lib/roomSpeakers'

const HOLD_AFTER_TYPEWRITER_MS = 2200
const CROSSFADE_DURATION_MS = 700

function NarrativePortrait({ compact = false, imageSrc, fallbackSrc, name, role, tone = 'gold' }) {
  const [src, setSrc] = useState(imageSrc)

  useEffect(() => {
    setSrc(imageSrc)
  }, [imageSrc])

  const frameToneClass =
    tone === 'silver'
      ? 'border-stone-300/16 bg-white/[0.03] shadow-[0_0_70px_rgba(255,255,255,0.05)]'
      : 'border-amber-300/18 bg-amber-100/5 shadow-[0_0_70px_rgba(212,175,55,0.07)]'

  const labelToneClass = tone === 'silver' ? 'text-stone-300' : 'text-amber-200/78'
  const portraitStyle = compact
    ? { width: 'clamp(8.5rem, 9.5vw, 10.5rem)', height: 'clamp(11.5rem, 24vh, 13.5rem)' }
    : { width: 'clamp(10rem, 11vw, 12.75rem)', height: 'clamp(13.5rem, 29vh, 16.75rem)' }

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={['relative overflow-hidden rounded-[2rem] border backdrop-blur-sm', frameToneClass].join(' ')}
        style={portraitStyle}
      >
        <img
          alt={name}
          className="h-full w-full object-contain object-top"
          onError={(e) => {
            if (fallbackSrc && src !== fallbackSrc) {
              setSrc(fallbackSrc)
              e.currentTarget.src = fallbackSrc
            }
          }}
          src={src}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(0,0,0,0.42)_100%)]" />
      </div>
      <p className={['mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.34em]', labelToneClass].join(' ')}>
        {role}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-[0.04em] text-amber-50 sm:text-2xl">{name}</h2>
    </div>
  )
}

function MusicRoomNarrative({ category, onComplete }) {
  const timeoutIdsRef = useRef([])
  const [scene, setScene] = useState('guardian')

  useBackgroundAudio({ src: '/audio/bg_music_room.mp3', volume: 0.15 }, true)

  const guardian = getRoomCharacterBySpeaker(category.characters, 'guardian')
  const inquisitor = getRoomCharacterBySpeaker(category.characters, 'inquisitor')
  const guardianMsg = getRoomNarrativeBySpeaker(category.introNarrative, 'guardian')?.message ?? ''
  const inquisitorMsg = getRoomNarrativeBySpeaker(category.introNarrative, 'inquisitor')?.message ?? ''

  function scheduleTimeout(callback, delay) {
    const id = setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((t) => t !== id)
      callback()
    }, delay)
    timeoutIdsRef.current.push(id)
  }

  useEffect(() => {
    return () => timeoutIdsRef.current.forEach((id) => clearTimeout(id))
  }, [])

  const isGuardianBoxVisible = scene === 'guardian'
  const isInquisitorVisible =
    scene === 'guardian-leaving' || scene === 'inquisitor' || scene === 'inquisitor-complete'
  const isInquisitorBoxVisible = scene === 'inquisitor' || scene === 'inquisitor-complete'
  const isCtaVisible = scene === 'inquisitor-complete'

  function handleGuardianComplete() {
    if (scene !== 'guardian') return
    scheduleTimeout(() => setScene('guardian-leaving'), HOLD_AFTER_TYPEWRITER_MS)
    scheduleTimeout(() => setScene('inquisitor'), HOLD_AFTER_TYPEWRITER_MS + CROSSFADE_DURATION_MS)
  }

  function handleInquisitorComplete() {
    if (scene !== 'inquisitor') return
    setScene('inquisitor-complete')
  }

  const backgroundImage = category.backgroundImage || null

  return (
    <section className="relative h-screen overflow-hidden px-5 py-5 text-amber-50 sm:px-7 sm:py-6">
      {backgroundImage ? (
        <img
          alt="Sala della musica"
          className="absolute inset-0 h-full w-full object-cover"
          src={backgroundImage}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.35)_30%,rgba(0,0,0,0.65)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-12 [background-image:linear-gradient(rgba(212,175,55,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative flex h-full flex-col overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-amber-200/72">
              {category.title}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-amber-50 sm:text-4xl lg:text-[2.7rem]">
              Le frequenze ti accolgono.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-amber-50/68">
              In questa sala ti attendono due presenze: il guardiano custodisce il passaggio, l'inquisitore ne mette alla prova il coraggio.
            </p>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="relative mt-2 flex flex-1 items-start overflow-hidden pb-24 pt-4 sm:mt-3 sm:pb-28 sm:pt-6 lg:pt-2">
          <div className="mx-auto hidden h-full w-full max-w-[88rem] lg:grid lg:grid-cols-[minmax(20rem,1fr)_minmax(18rem,22rem)_minmax(20rem,1fr)] lg:items-start lg:gap-4 xl:gap-6">
            <div className="flex h-full items-start justify-end lg:pt-10 xl:pt-12">
              <div
                className={[
                  'w-full max-w-[30rem] rounded-[2rem] border border-amber-300/18 bg-black/50 px-7 py-6 backdrop-blur-xl transition-all duration-700 ease-out lg:mr-[-0.5rem] xl:mr-[-1rem]',
                  isGuardianBoxVisible
                    ? 'translate-x-0 opacity-100 scale-100'
                    : '-translate-x-6 opacity-0 scale-[0.97] pointer-events-none',
                ].join(' ')}
              >
                <TypewriterText
                  alignment="left"
                  className="w-full text-base leading-7 text-stone-100 xl:text-[1.05rem] xl:leading-8"
                  isActive={scene === 'guardian'}
                  isComplete={scene !== 'guardian'}
                  onComplete={handleGuardianComplete}
                  text={guardianMsg}
                />
              </div>
            </div>

            <div className="relative flex h-full min-h-[30rem] items-start justify-center xl:min-h-[32rem]">
              {guardian ? (
                <div
                  className={[
                    'absolute left-1/2 top-0 z-10 -translate-x-1/2 scale-[0.92] pointer-events-none transition-all duration-700',
                    !isInquisitorVisible ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                >
                  <NarrativePortrait
                    imageSrc={guardian.imageSrc}
                    fallbackSrc={guardian.fallbackImageSrc}
                    name={guardian.name}
                    role={guardian.role}
                    tone={guardian.tone}
                  />
                </div>
              ) : null}
              {inquisitor ? (
                <div
                  className={[
                    'absolute left-1/2 top-0 z-10 -translate-x-1/2 scale-[0.92] pointer-events-none transition-all duration-700',
                    isInquisitorBoxVisible ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                >
                  <NarrativePortrait
                    imageSrc={inquisitor.imageSrc}
                    fallbackSrc={inquisitor.fallbackImageSrc}
                    name={inquisitor.name}
                    role={inquisitor.role}
                    tone={inquisitor.tone ?? 'silver'}
                  />
                </div>
              ) : null}
            </div>

            <div className="flex h-full items-start justify-start lg:pt-10 xl:pt-12">
              <div
                className={[
                  'w-full max-w-[30rem] rounded-[2rem] border border-stone-300/16 bg-black/54 px-7 py-6 backdrop-blur-xl transition-all duration-700 ease-out lg:ml-[-0.5rem] xl:ml-[-1rem]',
                  isInquisitorBoxVisible
                    ? 'translate-x-0 opacity-100 scale-100'
                    : 'translate-x-6 opacity-0 scale-[0.97] pointer-events-none',
                ].join(' ')}
              >
                <TypewriterText
                  alignment="left"
                  className="w-full text-base leading-7 text-stone-100 xl:text-[1.05rem] xl:leading-8"
                  isActive={scene === 'inquisitor' || scene === 'inquisitor-complete'}
                  isComplete={scene === 'inquisitor-complete'}
                  onComplete={handleInquisitorComplete}
                  text={inquisitorMsg}
                />
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center gap-5 lg:hidden">
            {guardian ? (
              <div
                className={[
                  'mx-auto transition-all duration-700',
                  !isInquisitorVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
                ].join(' ')}
              >
                <NarrativePortrait
                  imageSrc={guardian.imageSrc}
                  fallbackSrc={guardian.fallbackImageSrc}
                  name={guardian.name}
                  role={guardian.role}
                  tone={guardian.tone}
                />
              </div>
            ) : null}
            {inquisitor ? (
              <div
                className={[
                  'mx-auto transition-all duration-700',
                  isInquisitorBoxVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
                ].join(' ')}
              >
                <NarrativePortrait
                  imageSrc={inquisitor.imageSrc}
                  fallbackSrc={inquisitor.fallbackImageSrc}
                  name={inquisitor.name}
                  role={inquisitor.role}
                  tone={inquisitor.tone ?? 'silver'}
                />
              </div>
            ) : null}

            <div
              className={[
                'rounded-[2rem] border border-amber-300/18 bg-black/50 p-5 backdrop-blur-xl transition-all duration-700 ease-out',
                isGuardianBoxVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none',
              ].join(' ')}
            >
              <TypewriterText
                alignment="left"
                className="text-[0.95rem] leading-6 text-stone-100"
                isActive={scene === 'guardian'}
                isComplete={scene !== 'guardian'}
                onComplete={handleGuardianComplete}
                text={guardianMsg}
              />
            </div>

            <div
              className={[
                'rounded-[2rem] border border-stone-300/16 bg-black/54 p-5 backdrop-blur-xl transition-all duration-700 ease-out',
                isInquisitorBoxVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
              ].join(' ')}
            >
              <TypewriterText
                alignment="left"
                className="text-[0.95rem] leading-6 text-stone-100"
                isActive={scene === 'inquisitor' || scene === 'inquisitor-complete'}
                isComplete={scene === 'inquisitor-complete'}
                onComplete={handleInquisitorComplete}
                text={inquisitorMsg}
              />
            </div>
          </div>
        </div>

        <div className="absolute right-5 top-5 z-10 flex flex-col items-end gap-3 sm:right-6 sm:top-6 lg:right-7 lg:top-7">
          {!isCtaVisible ? (
            <button
              className="inline-flex items-center justify-center rounded-full border border-slate-500/40 bg-slate-900/60 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300 backdrop-blur-sm transition hover:border-slate-400/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400/25"
              onClick={onComplete}
              type="button"
            >
              Salta intro
            </button>
          ) : null}

          <div
            className={[
              'transition duration-700 ease-out',
              isCtaVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0',
            ].join(' ')}
          >
            <button
              className="inline-flex items-center justify-center rounded-full border border-amber-300/55 bg-amber-300/12 px-7 py-4 text-sm font-semibold uppercase tracking-[0.28em] text-amber-50 transition hover:border-amber-200 hover:bg-amber-300/18 focus:outline-none focus:ring-2 focus:ring-amber-300/25"
              onClick={onComplete}
              type="button"
            >
              Inizia i Quiz
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MusicRoomNarrative
