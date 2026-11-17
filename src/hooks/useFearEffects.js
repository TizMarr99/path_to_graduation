import { useCallback, useEffect, useRef, useState } from 'react'

const FEAR_EFFECT_DURATION_MS = 4000

export function useFearEffects(category, isAudioEnabled = true) {
  const [isFearActive, setIsFearActive] = useState(false)
  const [fearEffectKey, setFearEffectKey] = useState(0)
  const timeoutRef = useRef(null)
  const audioRef = useRef(null)
  const hasPersistentOverlay = Boolean(category?.fear?.spiderImageSrc || category?.fear?.flyingInsectImageSrcs?.length)

  const stopWrongAnswerAudio = useCallback(() => {
    if (!audioRef.current) {
      return
    }

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    audioRef.current = null
  }, [])

  const playWrongAnswerAudio = useCallback(() => {
    const rawSfxSrc = category?.fear?.sfxSrc
    const sfxSrc = Array.isArray(rawSfxSrc)
      ? rawSfxSrc[Math.floor(Math.random() * rawSfxSrc.length)] ?? ''
      : rawSfxSrc

    if (!sfxSrc || !isAudioEnabled) return

    try {
      stopWrongAnswerAudio()
      audioRef.current = new Audio(sfxSrc)
      audioRef.current.loop = hasPersistentOverlay
      audioRef.current.volume = hasPersistentOverlay ? 0.65 : 0.18
      audioRef.current.currentTime = 0
      void audioRef.current.play().catch(() => {})
    } catch {
      audioRef.current = null
    }
  }, [category, hasPersistentOverlay, isAudioEnabled, stopWrongAnswerAudio])

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
    if (isAudioEnabled && isFearActive) {
      if (!document.hidden && !audioRef.current) playWrongAnswerAudio()
      return
    }

    stopWrongAnswerAudio()
  }, [isAudioEnabled, isFearActive, playWrongAnswerAudio, stopWrongAnswerAudio])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') {
        stopWrongAnswerAudio()
      } else if (isFearActive && isAudioEnabled && !audioRef.current) {
        playWrongAnswerAudio()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isFearActive, isAudioEnabled, playWrongAnswerAudio, stopWrongAnswerAudio])

  const triggerWrongAnswerEffect = useCallback(() => {
    setFearEffectKey((value) => value + 1)
    setIsFearActive(true)

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    if (!hasPersistentOverlay) timeoutRef.current = window.setTimeout(() => {
      setIsFearActive(false)
    }, FEAR_EFFECT_DURATION_MS)

    playWrongAnswerAudio()
  }, [hasPersistentOverlay, playWrongAnswerAudio])

  return {
    fearEffectKey,
    isFearActive,
    stopWrongAnswerEffect,
    triggerWrongAnswerEffect,
  }
}

export default useFearEffects
