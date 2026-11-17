import { useState, useSyncExternalStore } from 'react'

function subscribe(onChange) {
  document.addEventListener('fullscreenchange', onChange)
  return () => document.removeEventListener('fullscreenchange', onChange)
}

function getSnapshot() {
  return Boolean(document.fullscreenElement)
}

function getServerSnapshot() {
  return false
}

export function useFullscreen() {
  const isFullscreen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const isSupported = typeof document !== 'undefined'
    && document.fullscreenEnabled === true
    && typeof document.documentElement.requestFullscreen === 'function'

  async function toggleFullscreen() {
    if (!isSupported || isPending) return

    setError('')
    setIsPending(true)
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        // Keep controls, route changes and native photo dialogs in the same fullscreen page.
        await document.documentElement.requestFullscreen()
      }
    } catch {
      setError('Il browser non ha consentito il cambio di schermo. Riprova dal pulsante.')
    } finally {
      setIsPending(false)
    }
  }

  return { isSupported, isFullscreen, isPending, error, toggleFullscreen }
}
