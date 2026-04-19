import { useEffect, useState } from 'react'
import TypewriterText from './TypewriterText.jsx'
import './vip-home.css'

const ANDREA_MESSAGE =
  'Benvenuta alla tua mostra privata. Il Critico ha nascosto alcuni pezzi nella Grotta delle Ombre. Queste rappresentano ciò che hai sempre evitato. In ogni sala troverai qualcuno che ti guiderà — ma anche chi vorrà fermarti. Sei pronta?'

const MIRANDA_MESSAGE =
  'Oh guarda chi si vede. Pensavi fosse una mostra qualunque? Ogni pezzo che ho nascosto è una tua paura. Nelle mani di chi? Vediamo se hai il coraggio di scoprirlo davvero...'

function NarrativePortrait({ compact = false, fallbackSrc, name, role, src, tone = 'gold' }) {
  const [portraitSrc, setPortraitSrc] = useState(src)

  useEffect(() => {
    setPortraitSrc(src)
  }, [src])

  const frameToneClass =
    tone === 'silver'
      ? 'border-stone-300/16 bg-white/[0.03] shadow-[0_0_70px_rgba(255,255,255,0.05)]'
      : 'border-amber-300/18 bg-amber-100/5 shadow-[0_0_70px_rgba(212,175,55,0.07)]'

  const labelToneClass = tone === 'silver' ? 'text-stone-300' : 'text-amber-200/78'
  const portraitStyle = compact
    ? {
        width: 'clamp(8.5rem, 9.5vw, 10.5rem)',
        height: 'clamp(11.5rem, 24vh, 13.5rem)',
      }
    : {
        width: 'clamp(10rem, 11vw, 12.75rem)',
        height: 'clamp(13.5rem, 29vh, 16.75rem)',
      }

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={['relative overflow-hidden rounded-[2rem] border backdrop-blur-sm', frameToneClass].join(' ')}
        style={portraitStyle}
      >
        <img
          alt={name}
          className="h-full w-full object-contain object-top"
          onError={(event) => {
            if (fallbackSrc && portraitSrc !== fallbackSrc) {
              setPortraitSrc(fallbackSrc)
              event.currentTarget.src = fallbackSrc
            }
          }}
          src={portraitSrc}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,rgba(0,0,0,0.42)_100%)]" />
      </div>
      <p className={['mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.34em]', labelToneClass].join(' ')}>
        {role}
      </p>
      <h2 className={compact ? 'mt-2 text-lg font-semibold tracking-[0.04em] text-amber-50 sm:text-xl' : 'mt-2 text-xl font-semibold tracking-[0.04em] text-amber-50 sm:text-2xl'}>
        {name}
      </h2>
    </div>
  )
}

function VipNarrative({
  andreaCharacter,
  andreaMessage = ANDREA_MESSAGE,
  backgroundImage = '/images/hall-gallery.png',
  compactLayout = false,
  ctaLabel = 'Entra nella Mostra',
  description = 'La mostra cambia volto, ma continua a parlare con le stesse due voci.',
  eyebrow = 'Private Gallery',
  logoSrc = '/images/logo-vip.png',
  mirandaCharacter,
  mirandaMessage = MIRANDA_MESSAGE,
  narrativeScene,
  onAndreaTypewriterComplete,
  onDiscoverMap,
  onMirandaTypewriterComplete,
  title = 'Le ombre stanno parlando.',
}) {
  const resolvedAndreaCharacter = andreaCharacter ?? {
    fallbackSrc: '/images/andrea_sachs.png',
    name: 'Andrea Sachs',
    role: 'Il Curatore',
    src: '/images/andrea_sachs.png',
    tone: 'gold',
  }
  const resolvedMirandaCharacter = mirandaCharacter ?? {
    fallbackSrc: '/images/amanda-priestly.png',
    name: 'Miranda Priestly',
    role: 'Il Critico',
    src: '/images/amanda-priestly.png',
    tone: 'silver',
  }
  const isAndreaBoxVisible = narrativeScene === 'andrea'
  const isMirandaVisible =
    narrativeScene === 'andrea-leaving' ||
    narrativeScene === 'miranda' ||
    narrativeScene === 'miranda-complete'
  const isMirandaBoxVisible = narrativeScene === 'miranda' || narrativeScene === 'miranda-complete'
  const areCtasVisible = narrativeScene === 'miranda-complete'
  const hasDescription = Boolean(description)

  return (
    <section className="relative h-screen overflow-hidden px-5 py-5 text-amber-50 sm:px-7 sm:py-6">
      <img
        alt="Hall della galleria"
        className="absolute inset-0 h-full w-full object-cover"
        src={backgroundImage}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_30%,rgba(0,0,0,0.62)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.14),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_28%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(212,175,55,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative flex h-full flex-col overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-amber-200/72">
              {eyebrow}
            </p>
            <h1 className={compactLayout ? 'mt-1 text-[1.45rem] font-semibold tracking-tight text-amber-50 sm:text-[2rem] lg:text-[2.15rem]' : 'mt-2 text-2xl font-semibold tracking-tight text-amber-50 sm:text-4xl lg:text-[2.7rem]'}>
              {title}
            </h1>
            {hasDescription ? (
              <p className={compactLayout ? 'mt-2 max-w-xl text-sm leading-6 text-amber-50/68' : 'mt-3 max-w-xl text-sm leading-6 text-amber-50/68'}>
                {description}
              </p>
            ) : null}
          </div>

          <div className="rounded-full border border-amber-300/22 bg-black/35 p-3 backdrop-blur-md">
            <img alt="VIP" className="h-12 w-auto sm:h-14" src={logoSrc} />
          </div>
        </div>

        <div className={compactLayout ? 'relative mt-1 flex flex-1 items-start overflow-hidden pb-32 pt-2 sm:mt-2 sm:pb-36 sm:pt-3 lg:pt-0' : 'relative mt-2 flex flex-1 items-start overflow-hidden pb-24 pt-4 sm:mt-3 sm:pb-28 sm:pt-6 lg:pt-2'}>
          <div className="mx-auto hidden h-full w-full max-w-[88rem] lg:grid lg:grid-cols-[minmax(20rem,1fr)_minmax(18rem,22rem)_minmax(20rem,1fr)] lg:items-start lg:gap-4 xl:gap-6">
            <div className={compactLayout ? 'flex h-full items-start justify-end lg:pt-2 xl:pt-4' : 'flex h-full items-start justify-end lg:pt-10 xl:pt-12'}>
              <div
                className={[
                  'w-full max-w-[30rem] transform-gpu rounded-[2rem] border border-amber-300/18 bg-black/50 px-7 py-6 backdrop-blur-xl transition-[opacity,transform] duration-700 ease-out lg:mr-[-0.5rem] xl:mr-[-1rem]',
                  isAndreaBoxVisible
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-4 opacity-0 pointer-events-none',
                ].join(' ')}
                style={{ backfaceVisibility: 'hidden', willChange: 'transform, opacity' }}
              >
                <TypewriterText
                  alignment="left"
                  className={compactLayout ? 'w-full text-[0.95rem] leading-7 text-stone-100 xl:text-base xl:leading-7' : 'w-full text-base leading-7 text-stone-100 xl:text-[1.05rem] xl:leading-8'}
                  isActive={narrativeScene === 'andrea'}
                  isComplete={narrativeScene !== 'andrea'}
                  onComplete={onAndreaTypewriterComplete}
                  text={andreaMessage}
                />
              </div>
            </div>

            <div className={compactLayout ? 'relative flex h-full min-h-[24rem] items-start justify-center xl:min-h-[26rem]' : 'relative flex h-full min-h-[30rem] items-start justify-center xl:min-h-[32rem]'}>
              <div
                className={[
                  'absolute left-1/2 top-0 z-10 -translate-x-1/2 scale-[0.92] pointer-events-none transition-all duration-700',
                  !isMirandaVisible ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              >
                <NarrativePortrait
                  compact={compactLayout}
                  fallbackSrc={resolvedAndreaCharacter.fallbackSrc}
                  name={resolvedAndreaCharacter.name}
                  role={resolvedAndreaCharacter.role}
                  src={resolvedAndreaCharacter.src}
                  tone={resolvedAndreaCharacter.tone}
                />
              </div>

              <div
                className={[
                  'absolute left-1/2 top-0 z-10 -translate-x-1/2 scale-[0.92] pointer-events-none transition-all duration-700',
                  isMirandaBoxVisible ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
              >
                <NarrativePortrait
                  compact={compactLayout}
                  fallbackSrc={resolvedMirandaCharacter.fallbackSrc}
                  name={resolvedMirandaCharacter.name}
                  role={resolvedMirandaCharacter.role}
                  src={resolvedMirandaCharacter.src}
                  tone={resolvedMirandaCharacter.tone}
                />
              </div>
            </div>

            <div className={compactLayout ? 'flex h-full items-start justify-start lg:pt-2 xl:pt-4' : 'flex h-full items-start justify-start lg:pt-10 xl:pt-12'}>
              <div
                className={[
                  'w-full max-w-[30rem] transform-gpu rounded-[2rem] border border-stone-300/16 bg-black/54 px-7 py-6 backdrop-blur-xl transition-[opacity,transform] duration-700 ease-out lg:ml-[-0.5rem] xl:ml-[-1rem]',
                  isMirandaBoxVisible
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-4 opacity-0 pointer-events-none',
                ].join(' ')}
                style={{ backfaceVisibility: 'hidden', willChange: 'transform, opacity' }}
              >
                <TypewriterText
                  alignment="left"
                  className={compactLayout ? 'w-full text-[0.95rem] leading-7 text-stone-100 xl:text-base xl:leading-7' : 'w-full text-base leading-7 text-stone-100 xl:text-[1.05rem] xl:leading-8'}
                  isActive={narrativeScene === 'miranda'}
                  isComplete={narrativeScene === 'miranda-complete'}
                  onComplete={onMirandaTypewriterComplete}
                  text={mirandaMessage}
                />
              </div>
            </div>
          </div>

          <div className="mx-auto flex h-full w-full max-w-2xl flex-col justify-center gap-5 lg:hidden">
            <div
              className={[
                'mx-auto transition-all duration-700',
                !isMirandaVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
              ].join(' ')}
            >
              <NarrativePortrait
                fallbackSrc={resolvedAndreaCharacter.fallbackSrc}
                name={resolvedAndreaCharacter.name}
                role={resolvedAndreaCharacter.role}
                src={resolvedAndreaCharacter.src}
                tone={resolvedAndreaCharacter.tone}
              />
            </div>

            <div
              className={[
                'rounded-[2rem] border border-amber-300/18 bg-black/50 p-5 backdrop-blur-xl transition-all duration-700 ease-out',
                isAndreaBoxVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none',
              ].join(' ')}
            >
              <TypewriterText
                alignment="left"
                className="text-[0.95rem] leading-6 text-stone-100"
                isActive={narrativeScene === 'andrea'}
                isComplete={narrativeScene !== 'andrea'}
                onComplete={onAndreaTypewriterComplete}
                text={andreaMessage}
              />
            </div>

            {isMirandaVisible ? (
              <div
                className={[
                  'mx-auto transition-all duration-700',
                  isMirandaBoxVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
                ].join(' ')}
              >
                <NarrativePortrait
                  compact
                  fallbackSrc={resolvedMirandaCharacter.fallbackSrc}
                  name={resolvedMirandaCharacter.name}
                  role={resolvedMirandaCharacter.role}
                  src={resolvedMirandaCharacter.src}
                  tone={resolvedMirandaCharacter.tone}
                />
              </div>
            ) : null}

            <div
              className={[
                'rounded-[2rem] border border-stone-300/16 bg-black/54 p-5 backdrop-blur-xl transition-all duration-700 ease-out',
                isMirandaBoxVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
              ].join(' ')}
            >
              <TypewriterText
                alignment="left"
                className="text-[0.95rem] leading-6 text-stone-100"
                isActive={narrativeScene === 'miranda'}
                isComplete={narrativeScene === 'miranda-complete'}
                onComplete={onMirandaTypewriterComplete}
                text={mirandaMessage}
              />
            </div>
          </div>
        </div>

        <div
          className={[
            compactLayout
              ? 'absolute inset-x-0 bottom-4 z-20 mx-auto flex w-full max-w-[23rem] flex-col justify-center gap-3 px-5 transition duration-700 ease-out sm:bottom-5 sm:max-w-3xl sm:flex-row sm:px-0'
              : 'absolute inset-x-0 bottom-3 z-20 mx-auto flex w-full max-w-[27rem] flex-col justify-center gap-3 px-5 transition duration-700 ease-out sm:bottom-4 sm:max-w-3xl sm:flex-row sm:px-0',
            areCtasVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-5 opacity-0',
          ].join(' ')}
        >
          <button
            className="inline-flex items-center justify-center rounded-full border border-amber-300/55 bg-amber-300/12 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-50 transition hover:border-amber-200 hover:bg-amber-300/18 focus:outline-none focus:ring-2 focus:ring-amber-300/25 sm:px-7 sm:text-sm"
            onClick={onDiscoverMap}
            type="button"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

export default VipNarrative