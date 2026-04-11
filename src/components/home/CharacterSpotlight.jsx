import { useEffect, useState } from 'react'
import TypewriterText from './TypewriterText.jsx'

function CharacterSpotlight({
  className = '',
  compact = false,
  imageFallbackSrc,
  imageSrc,
  isActive,
  isComplete,
  isLeaving,
  message,
  name,
  onTypewriterComplete,
  role,
  showMessage = true,
  textAlignment = 'center',
  textPosition = 'right',
  tone = 'gold',
}) {
  const [portraitSrc, setPortraitSrc] = useState(imageSrc)

  useEffect(() => {
    setPortraitSrc(imageSrc)
  }, [imageSrc])

  const portraitToneClass =
    tone === 'silver'
      ? 'border-stone-300/16 bg-white/[0.03] shadow-[0_0_80px_rgba(255,255,255,0.05)]'
      : 'border-amber-300/18 bg-amber-100/5 shadow-[0_0_80px_rgba(212,175,55,0.07)]'

  const labelToneClass = tone === 'silver' ? 'text-stone-300' : 'text-amber-200/78'
  const panelToneClass =
    tone === 'silver'
      ? 'border-stone-300/16 bg-black/52 shadow-[0_0_70px_rgba(255,255,255,0.04)]'
      : 'border-amber-300/18 bg-black/48 shadow-[0_0_70px_rgba(212,175,55,0.05)]'
  const portraitSizeClass = compact
    ? 'h-[220px] w-[165px] sm:h-[280px] sm:w-[210px]'
    : 'h-[280px] w-[210px] sm:h-[360px] sm:w-[270px]'
  const wrapperClass = showMessage
    ? [
        'grid w-full gap-6 lg:items-center',
        textPosition === 'left'
          ? 'lg:grid-cols-[minmax(0,1fr)_270px]'
          : 'lg:grid-cols-[270px_minmax(0,1fr)]',
      ].join(' ')
    : 'flex flex-col items-center gap-4'
  const portraitOrderClass = showMessage && textPosition === 'left' ? 'lg:order-2' : ''
  const panelOrderClass = showMessage && textPosition === 'left' ? 'lg:order-1' : ''
  const panelTextClass = textAlignment === 'left' ? 'items-start text-left' : 'items-center text-center'

  return (
    <article
      className={[
        'mx-auto w-full px-4 transition duration-700 ease-out',
        isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.985] pointer-events-none',
        isLeaving ? 'opacity-0 -translate-y-4 scale-[0.97] pointer-events-none' : '',
        className,
      ].join(' ')}
    >
      <div className={wrapperClass}>
        <div
          className={[
            'relative overflow-hidden rounded-[2rem] border backdrop-blur-sm',
            portraitToneClass,
            portraitSizeClass,
            portraitOrderClass,
          ].join(' ')}
        >
          <img
            alt={name}
            className="h-full w-full object-cover"
            onError={(event) => {
              if (imageFallbackSrc && portraitSrc !== imageFallbackSrc) {
                setPortraitSrc(imageFallbackSrc)
                event.currentTarget.src = imageFallbackSrc
              }
            }}
            src={portraitSrc}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.38)_100%)]" />
        </div>

        {showMessage ? (
          <div
            className={[
              'flex min-w-0 flex-col rounded-[2rem] border p-6 backdrop-blur-xl sm:p-8',
              panelToneClass,
              panelOrderClass,
              panelTextClass,
            ].join(' ')}
          >
            <p className={['text-[0.72rem] font-semibold uppercase tracking-[0.38em]', labelToneClass].join(' ')}>
              {role}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[0.04em] text-amber-50 sm:text-4xl">
              {name}
            </h2>
            <TypewriterText
              alignment={textAlignment}
              className="mt-6 max-w-[38ch] text-lg leading-8 text-stone-100 sm:text-[1.16rem] sm:leading-9"
              isActive={isActive}
              isComplete={isComplete || isLeaving}
              onComplete={onTypewriterComplete}
              text={message}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <p className={['mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.34em]', labelToneClass].join(' ')}>
              {role}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[0.04em] text-amber-50 sm:text-2xl">
              {name}
            </h2>
          </div>
        )}
      </div>
    </article>
  )
}

export default CharacterSpotlight