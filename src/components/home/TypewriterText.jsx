import { useEffect, useRef, useState } from 'react'

const TYPEWRITER_MS_PER_CHARACTER = 80

function TypewriterText({
  alignment = 'center',
  className = '',
  isActive,
  isComplete,
  onComplete,
  text,
}) {
  const [visibleLength, setVisibleLength] = useState(() => (isComplete ? text.length : 0))
  const hasCompletedRef = useRef(false)
  const intervalIdRef = useRef(0)
  const frameIdRef = useRef(0)

  function clearTimers() {
    window.clearInterval(intervalIdRef.current)
    window.cancelAnimationFrame(frameIdRef.current)
    intervalIdRef.current = 0
    frameIdRef.current = 0
  }

  function completeTextImmediately() {
    clearTimers()

    setVisibleLength((currentLength) => {
      if (currentLength >= text.length) {
        return currentLength
      }

      return text.length
    })

    if (onComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true
      onComplete()
    }
  }

  function handleSkip() {
    if (!isActive || isComplete || visibleLength >= text.length) {
      return
    }

    completeTextImmediately()
  }

  function handleSkipKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    handleSkip()
  }

  useEffect(() => {
    hasCompletedRef.current = false
    clearTimers()
  }, [text])

  useEffect(() => {
    clearTimers()

    if (isComplete) {
      frameIdRef.current = window.requestAnimationFrame(() => setVisibleLength(text.length))
      hasCompletedRef.current = true
      return () => clearTimers()
    }

    if (!isActive) {
      hasCompletedRef.current = false
      frameIdRef.current = window.requestAnimationFrame(() => setVisibleLength(0))
      return () => clearTimers()
    }

    if (!text.length) {
      frameIdRef.current = window.requestAnimationFrame(() => {
        setVisibleLength(0)

        if (onComplete && !hasCompletedRef.current) {
          hasCompletedRef.current = true
          onComplete()
        }
      })

      return () => clearTimers()
    }

    let nextLength = 0

    frameIdRef.current = window.requestAnimationFrame(() => {
      setVisibleLength(0)

      intervalIdRef.current = window.setInterval(() => {
        nextLength += 1
        setVisibleLength(nextLength)

        if (nextLength >= text.length) {
          window.clearInterval(intervalIdRef.current)
          intervalIdRef.current = 0

          if (onComplete && !hasCompletedRef.current) {
            hasCompletedRef.current = true
            onComplete()
          }
        }
      }, TYPEWRITER_MS_PER_CHARACTER)
    })

    return () => clearTimers()
  }, [isActive, isComplete, onComplete, text])

  useEffect(() => clearTimers, [])

  const isSkippable = isActive && !isComplete && visibleLength < text.length

  return (
    <div className={className}>
      <p
        aria-label={isSkippable ? 'Messaggio in scrittura' : undefined}
        className={isSkippable ? 'select-none' : ''}
      >
        <span
          className={[
            'vip-typewriter',
            alignment === 'left' ? 'vip-typewriter--left' : 'vip-typewriter--center',
            isActive && !isComplete && visibleLength < text.length ? 'vip-typewriter--cursor' : '',
          ].join(' ')}
        >
          {text.slice(0, visibleLength)}
        </span>
      </p>
      {isSkippable ? (
        <button
          className="mt-3 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/6 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
          onClick={handleSkip}
          onKeyDown={handleSkipKeyDown}
          type="button"
        >
          Mostra tutto
        </button>
      ) : null}
    </div>
  )
}

export default TypewriterText