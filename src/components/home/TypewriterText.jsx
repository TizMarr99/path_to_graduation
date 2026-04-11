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

  useEffect(() => {
    hasCompletedRef.current = false
  }, [text])

  useEffect(() => {
    if (!isActive) {
      setVisibleLength(0)
      hasCompletedRef.current = false
      return undefined
    }

    if (isComplete) {
      setVisibleLength(text.length)
      hasCompletedRef.current = true
      return undefined
    }

    setVisibleLength(0)

    if (!text.length) {
      if (onComplete && !hasCompletedRef.current) {
        hasCompletedRef.current = true
        onComplete()
      }

      return undefined
    }

    let nextLength = 0

    const intervalId = window.setInterval(() => {
      nextLength += 1
      setVisibleLength(nextLength)

      if (nextLength >= text.length) {
        window.clearInterval(intervalId)

        if (onComplete && !hasCompletedRef.current) {
          hasCompletedRef.current = true
          onComplete()
        }
      }
    }, TYPEWRITER_MS_PER_CHARACTER)

    return () => window.clearInterval(intervalId)
  }, [isActive, isComplete, onComplete, text])

  return (
    <p className={className}>
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
  )
}

export default TypewriterText