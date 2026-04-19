import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VipNarrative from '../components/home/VipNarrative.jsx'
import { useBackgroundAudio } from '../hooks/useBackgroundAudio'
import { usePlayerState } from '../hooks/usePlayerState'
import { getCategoryById } from '../lib/challengeData'
import { getRoomTransition } from '../lib/roomTransitions'

const CHARACTER_HOLD_AFTER_TYPEWRITER_MS = 2200
const CHARACTER_CROSSFADE_DURATION_MS = 700
const AMANDA_BOX_EXIT_DURATION_MS = 380

export default function BridgePage() {
  const navigate = useNavigate()
  const { markPendingBridgeSeen, playerState } = usePlayerState()
  const timeoutIdsRef = useRef([])
  const [narrativeScene, setNarrativeScene] = useState('andrea')
  const pendingBridge = playerState.transitionState?.pendingBridge ?? null

  useBackgroundAudio({ src: '/audio/bg_intro.mp3', volume: 0.15 }, true)

  useEffect(() => {
    if (!pendingBridge || pendingBridge.bridgeCompletedAt) {
      navigate('/shadows', { replace: true })
    }
  }, [navigate, pendingBridge])

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutIdsRef.current = []
    }
  }, [])

  function scheduleTimeout(callback, delay) {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((id) => id !== timeoutId)
      callback()
    }, delay)

    timeoutIdsRef.current.push(timeoutId)
  }

  function handleAndreaTypewriterComplete() {
    if (narrativeScene !== 'andrea') {
      return
    }

    scheduleTimeout(() => setNarrativeScene('andrea-leaving'), CHARACTER_HOLD_AFTER_TYPEWRITER_MS)
    scheduleTimeout(
      () => setNarrativeScene('miranda'),
      CHARACTER_HOLD_AFTER_TYPEWRITER_MS + CHARACTER_CROSSFADE_DURATION_MS,
    )
  }

  function handleMirandaTypewriterComplete() {
    if (narrativeScene !== 'miranda') {
      return
    }

    scheduleTimeout(() => setNarrativeScene('miranda-complete'), AMANDA_BOX_EXIT_DURATION_MS)
  }

  function handleGoToMap() {
    markPendingBridgeSeen()
    navigate('/shadows', { replace: true })
  }

  if (!pendingBridge || pendingBridge.bridgeCompletedAt) {
    return null
  }

  const transition = getRoomTransition(pendingBridge.sourceCategoryId)
  const targetCategory = getCategoryById(pendingBridge.targetCategoryId)

  if (!transition || !targetCategory) {
    return null
  }

  const bridgeNarrative = transition.bridgeNarrative

  return (
    <div className="min-h-screen bg-black text-amber-50">
      <VipNarrative
        andreaCharacter={{
          fallbackSrc: '/images/andrea_sachs.png',
          name: bridgeNarrative.andrea.name,
          role: bridgeNarrative.andrea.role,
          src: '/images/andrea_sachs.png',
          tone: 'gold',
        }}
        andreaMessage={bridgeNarrative.andrea.message}
        ctaLabel={bridgeNarrative.ctaLabel}
        description={bridgeNarrative.description}
        eyebrow={bridgeNarrative.eyebrow}
        mirandaCharacter={{
          fallbackSrc: '/images/amanda-priestly.png',
          name: bridgeNarrative.miranda.name,
          role: bridgeNarrative.miranda.role,
          src: '/images/amanda-priestly.png',
          tone: 'silver',
        }}
        mirandaMessage={bridgeNarrative.miranda.message}
        narrativeScene={narrativeScene}
        onAndreaTypewriterComplete={handleAndreaTypewriterComplete}
        onDiscoverMap={handleGoToMap}
        onMirandaTypewriterComplete={handleMirandaTypewriterComplete}
        compactLayout
        title={bridgeNarrative.title}
      />
    </div>
  )
}