import { useCallback, useEffect, useRef, useState } from 'react'

const FEAR_EFFECT_DURATION_MS = 4000

export function useFearEffects(category, isAudioEnabled = true) {
  const [isFearActive, setIsFearActive] = useState(false)
  const timeoutRef = useRef(null)
  const audioRef = useRef(null)

  const stopWrongAnswerAudio = useCallback(() => {
    if (!audioRef.current) {
      return
    }

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    audioRef.current = null
  }, [])

  const stopWrongAnswerEffect = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setIsFearActive(false)

    stopWrongAnswerAudio()
  }, [stopWrongAnswerAudio])

  useEffect(() => {
    return () => {
      stopWrongAnswerEffect()
    }
  }, [stopWrongAnswerEffect])

  useEffect(() => {
    if (isAudioEnabled) {
      return
    }

    stopWrongAnswerAudio()
  }, [isAudioEnabled, stopWrongAnswerAudio])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') {
        stopWrongAnswerAudio()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [stopWrongAnswerAudio])

  const triggerWrongAnswerEffect = useCallback(() => {
    setIsFearActive(true)

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsFearActive(false)
    }, FEAR_EFFECT_DURATION_MS)

    const rawSfxSrc = category?.fear?.sfxSrc
    const sfxSrc = Array.isArray(rawSfxSrc)
      ? rawSfxSrc[Math.floor(Math.random() * rawSfxSrc.length)] ?? ''
      : rawSfxSrc

    if (!sfxSrc || !isAudioEnabled) {
      return
    }

    try {
      stopWrongAnswerAudio()
      audioRef.current = new Audio(sfxSrc)
      audioRef.current.volume = 0.18
      audioRef.current.currentTime = 0
      void audioRef.current.play().catch(() => {})
    } catch {
      audioRef.current = null
    }
  }, [category?.fear?.sfxSrc, isAudioEnabled, stopWrongAnswerAudio])

  return {
    isFearActive,
    stopWrongAnswerEffect,
    triggerWrongAnswerEffect,
  }
}

export default useFearEffects