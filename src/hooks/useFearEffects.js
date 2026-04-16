import { useCallback, useEffect, useRef, useState } from 'react'

const FEAR_EFFECT_DURATION_MS = 4000

export function useFearEffects(category) {
  const [isFearActive, setIsFearActive] = useState(false)
  const timeoutRef = useRef(null)
  const audioRef = useRef(null)

  const stopWrongAnswerEffect = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setIsFearActive(false)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stopWrongAnswerEffect()
    }
  }, [stopWrongAnswerEffect])

  const triggerWrongAnswerEffect = useCallback(() => {
    setIsFearActive(true)

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsFearActive(false)
    }, FEAR_EFFECT_DURATION_MS)

    const sfxSrc = category?.fear?.sfxSrc

    if (!sfxSrc) {
      return
    }

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(sfxSrc)
        audioRef.current.volume = 0.18
      }

      if (audioRef.current.paused) {
        audioRef.current.currentTime = 0
        void audioRef.current.play().catch(() => {})
      }
    } catch {
      audioRef.current = null
    }
  }, [category?.fear?.sfxSrc])

  return {
    isFearActive,
    stopWrongAnswerEffect,
    triggerWrongAnswerEffect,
  }
}

export default useFearEffects