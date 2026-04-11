import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VipIntroVideo from '../components/home/VipIntroVideo.jsx'
import VipLoginScreen from '../components/home/VipLoginScreen.jsx'
import VipNarrative from '../components/home/VipNarrative.jsx'
import { useVipAccess } from '../hooks/useVipAccess'

const ACCESS_CODE = '310119'
const LOGIN_FADE_DURATION_MS = 700
const VIDEO_FADE_DURATION_MS = 700
const CHARACTER_HOLD_AFTER_TYPEWRITER_MS = 2200
const CHARACTER_CROSSFADE_DURATION_MS = 700
const AMANDA_BOX_EXIT_DURATION_MS = 380

function HomePage() {
  const navigate = useNavigate()
  const { grantVipAccess, hasVipAccess } = useVipAccess()
  const timeoutIdsRef = useRef([])
  const [stage, setStage] = useState('login')
  const [narrativeScene, setNarrativeScene] = useState('andrea')
  const [personalCode, setPersonalCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoginLeaving, setIsLoginLeaving] = useState(false)
  const [isVideoLeaving, setIsVideoLeaving] = useState(false)

  function scheduleTimeout(callback, delay) {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((id) => id !== timeoutId)
      callback()
    }, delay)

    timeoutIdsRef.current.push(timeoutId)
  }

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutIdsRef.current = []
    }
  }, [])

  function handleCodeChange(nextCode) {
    setPersonalCode(nextCode)

    if (errorMessage) {
      setErrorMessage('')
    }
  }

  function handleLoginSubmit(event) {
    event.preventDefault()

    if (!hasVipAccess && personalCode.trim() !== ACCESS_CODE) {
      setErrorMessage('Il codice personale non e corretto.')
      return
    }

    if (!hasVipAccess) {
      grantVipAccess()
    }

    setErrorMessage('')
    setIsLoginLeaving(true)

    scheduleTimeout(() => {
      setStage('video')
      setIsLoginLeaving(false)
      setPersonalCode('')
    }, LOGIN_FADE_DURATION_MS)
  }

  function handleVideoEnded() {
    setIsVideoLeaving(true)

    scheduleTimeout(() => {
      setStage('narrative')
      setIsVideoLeaving(false)
      setNarrativeScene('andrea')
    }, VIDEO_FADE_DURATION_MS)
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
    navigate('/map')
  }

  function handleEnterMusicRoom() {
    navigate('/play/musica')
  }

  return (
    <div className="min-h-screen bg-black text-amber-50">
      {stage === 'login' ? (
        <VipLoginScreen
          code={personalCode}
          errorMessage={errorMessage}
          hasVipAccess={hasVipAccess}
          isLeaving={isLoginLeaving}
          onCodeChange={handleCodeChange}
          onSubmit={handleLoginSubmit}
        />
      ) : null}

      {stage === 'video' ? (
        <VipIntroVideo isLeaving={isVideoLeaving} onEnded={handleVideoEnded} />
      ) : null}

      {stage === 'narrative' ? (
        <VipNarrative
          narrativeScene={narrativeScene}
          onAndreaTypewriterComplete={handleAndreaTypewriterComplete}
          onDiscoverMap={handleGoToMap}
          onEnterMusicRoom={handleEnterMusicRoom}
          onMirandaTypewriterComplete={handleMirandaTypewriterComplete}
        />
      ) : null}
    </div>
  )
}

export default HomePage