import { useEffect, useRef, useState } from 'react'

/**
 * Plays a looping background audio track.
 *
 * @param {{ src?: string, startTime?: number, endTime?: number|null, volume?: number }} config
 *   - src       — public path to the audio file
 *   - startTime — playback start position in seconds (default 0)
 *   - endTime   — loop wrap-back point in seconds; null = native loop to end (default null)
 *   - volume    — 0–1 (default 0.15)
 * @param {boolean} isPlaying — whether the track should currently be playing
 */
export function useBackgroundAudio(
  { src, startTime = 0, endTime = null, volume = 0.15 } = {},
  isPlaying = false,
) {
  const startTimeRef = useRef(startTime)
  const endTimeRef = useRef(endTime)
  const audioRef = useRef(null)
  const [isPageVisible, setIsPageVisible] = useState(
    () => (typeof document === 'undefined' ? true : document.visibilityState === 'visible'),
  )

  // Keep refs current so event handlers always read fresh values.
  useEffect(() => {
    startTimeRef.current = startTime
  }, [startTime])

  useEffect(() => {
    endTimeRef.current = endTime
  }, [endTime])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    function handleVisibilityChange() {
      setIsPageVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Create / replace the Audio element whenever src changes.
  useEffect(() => {
    if (!src) return

    const audio = new Audio(src)
    audio.volume = volume
    // Use native loop only when no segment end is configured.
    audio.loop = endTime === null

    function handleTimeUpdate() {
      const end = endTimeRef.current
      if (end !== null && audio.currentTime >= end) {
        audio.currentTime = startTimeRef.current
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.src = ''
      audioRef.current = null
    }
    // volume and endTime are intentionally excluded: volume is handled by a
    // separate effect; endTime is read via ref so the handler stays current
    // without recreating the element.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  // Play / pause reactively. Restarts from startTime on each play transition.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && isPageVisible) {
      audio.currentTime = startTimeRef.current
      void audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPageVisible, isPlaying, src])

  // Keep volume in sync without recreating the element.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])
}
