import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerState } from '../../hooks/usePlayerState'
import { sendMusicPrizeMail1, sendMusicPrizeMail2 } from '../../lib/emailApi'

const VICTORY_AUDIO_SRC = '/audio/music-prize-won.mp3'
const VICTORY_AUDIO_START_TIME = 10
const VICTORY_AUDIO_VOLUME = 0.26
const VICTORY_AUDIO_FADE_OUT_MS = 900

/**
 * Modal shown when player completes the music room (8/12 threshold).
 * Features character dialogues from Achille Lauro (Guardian) and Sal da Vinci (Inquisitor),
 * artifact display, and navigation back to Shadow Hall.
 */
export default function MusicRoomVictoryModal({ category, sessionCorrectCount, sessionWrongCount, totalChallenges }) {
  const navigate = useNavigate()
  const { accessCode } = usePlayerState()
  const audioRef = useRef(null)
  const fadeIntervalRef = useRef(null)
  const emailSentRef = useRef(false)
  const [isClosing, setIsClosing] = useState(false)

  const guardian = category.characters?.guardian
  const inquisitor = category.characters?.inquisitor

  useEffect(() => {
    const audio = new Audio(VICTORY_AUDIO_SRC)
    audio.preload = 'auto'
    audio.volume = VICTORY_AUDIO_VOLUME
    audioRef.current = audio

    function startPlayback() {
      try {
        audio.currentTime = VICTORY_AUDIO_START_TIME
      } catch {
        return
      }

      void audio.play().catch(() => {})
    }

    if (audio.readyState >= 1) {
      startPlayback()
    } else {
      audio.addEventListener('loadedmetadata', startPlayback, { once: true })
    }

    return () => {
      if (fadeIntervalRef.current) {
        window.clearInterval(fadeIntervalRef.current)
        fadeIntervalRef.current = null
      }

      audio.pause()
      audio.src = ''

      if (audioRef.current === audio) {
        audioRef.current = null
      }
    }
  }, [])

  // Send prize emails on mount (fire-and-forget, idempotent on server side)
  useEffect(() => {
    if (emailSentRef.current || !accessCode) return
    emailSentRef.current = true

    void sendMusicPrizeMail1(accessCode).catch(() => {})
    void sendMusicPrizeMail2(accessCode).catch(() => {})
  }, [accessCode])

  function fadeOutVictoryAudio(onComplete) {
    const audio = audioRef.current

    if (!audio) {
      onComplete()
      return
    }

    if (fadeIntervalRef.current) {
      window.clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }

    const initialVolume = audio.volume

    if (initialVolume <= 0) {
      audio.pause()
      onComplete()
      return
    }

    const steps = 12
    const stepDuration = Math.max(16, Math.floor(VICTORY_AUDIO_FADE_OUT_MS / steps))
    let currentStep = 0

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep += 1
      const progress = currentStep / steps
      audio.volume = Math.max(0, initialVolume * (1 - progress))

      if (currentStep < steps) {
        return
      }

      window.clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
      audio.pause()
      audio.currentTime = VICTORY_AUDIO_START_TIME
      audio.volume = VICTORY_AUDIO_VOLUME
      onComplete()
    }, stepDuration)
  }

  function handleContinue() {
    if (isClosing) {
      return
    }

    setIsClosing(true)
    fadeOutVictoryAudio(() => {
      navigate('/shadows')
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(to bottom, rgba(2, 6, 23, 0.95), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: '24px',
          boxShadow: '0 0 60px rgba(212, 175, 55, 0.3)',
          padding: '32px',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleContinue}
          disabled={isClosing}
          aria-label="Chiudi"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '50%',
            color: 'rgba(253, 230, 138, 0.8)',
            fontSize: '1.1rem',
            cursor: isClosing ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)'
          }}
        >
          ✕
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#fde68a',
              textShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
              marginBottom: '12px',
            }}
          >
            Sala delle Frequenze Superata
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '2px',
                background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.6))',
              }}
            />
            <span
              style={{
                fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(253, 230, 138, 0.7)',
              }}
            >
              Premio ottenuto
            </span>
            <div
              style={{
                width: '40px',
                height: '2px',
                background: 'linear-gradient(to left, transparent, rgba(212, 175, 55, 0.6))',
              }}
            />
          </div>
        </div>

        {/* Score summary */}
        {typeof sessionCorrectCount === 'number' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginBottom: '28px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#4ade80' }}>
                {sessionCorrectCount}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(74, 222, 128, 0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Corrette
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f87171' }}>
                {sessionWrongCount ?? 0}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(248, 113, 113, 0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sbagliate
              </p>
            </div>
            {typeof totalChallenges === 'number' && totalChallenges > (sessionCorrectCount + (sessionWrongCount ?? 0)) && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#94a3b8' }}>
                  {totalChallenges - sessionCorrectCount - (sessionWrongCount ?? 0)}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Restanti
                </p>
              </div>
            )}
          </div>
        )}

        {/* Guardian dialogue */}
        {guardian && (
          <div
            style={{
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {guardian.imageSrc && (
                <img
                  src={guardian.imageSrc}
                  alt={guardian.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid rgba(212, 175, 55, 0.5)',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    if (guardian.fallbackImageSrc && e.target.src !== guardian.fallbackImageSrc) {
                      e.target.src = guardian.fallbackImageSrc
                    }
                  }}
                />
              )}
              <div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(212, 175, 55, 0.8)',
                    marginBottom: '2px',
                  }}
                >
                  {guardian.role || 'Il Guardiano'}
                </p>
                <p
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#fde68a',
                  }}
                >
                  {guardian.name}
                </p>
              </div>
            </div>
            <p
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.95rem',
                lineHeight: '1.7',
                color: '#e0f2fe',
                fontStyle: 'italic',
              }}
            >
              "Hai superato la soglia che separa il rumore dalla musica. Le frequenze ti riconoscono: questo artefatto è la prova che sai ascoltare davvero."
            </p>
          </div>
        )}

        {/* Inquisitor dialogue */}
        {inquisitor && (
          <div
            style={{
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(148, 163, 184, 0.08)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {inquisitor.imageSrc && (
                <img
                  src={inquisitor.imageSrc}
                  alt={inquisitor.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid rgba(148, 163, 184, 0.5)',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    if (inquisitor.fallbackImageSrc && e.target.src !== inquisitor.fallbackImageSrc) {
                      e.target.src = inquisitor.fallbackImageSrc
                    }
                  }}
                />
              )}
              <div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(148, 163, 184, 0.8)',
                    marginBottom: '2px',
                  }}
                >
                  {inquisitor.role || "L'Inquisitore"}
                </p>
                <p
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#cbd5e1',
                  }}
                >
                  {inquisitor.name}
                </p>
              </div>
            </div>
            <p
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.95rem',
                lineHeight: '1.7',
                color: '#e0f2fe',
                fontStyle: 'italic',
              }}
            >
              "Ammetto che non me l'aspettavo. Pochi escono dalla Sala delle Frequenze con qualcosa di più di un fischio nelle orecchie."
            </p>
          </div>
        )}

        {/* Artifact display */}
        <div
          style={{
            marginBottom: '28px',
            padding: '24px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '2px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <img
              src="/images/rooms/music-artifact-no-bg.png"
              alt="Accordatore di Ombre"
              style={{
                width: '100px',
                height: '100px',
                filter: 'drop-shadow(0 0 16px rgba(212, 175, 55, 0.6))',
                objectFit: 'contain',
              }}
              onError={(e) => {
                // Fallback to emoji if image not found
                e.target.style.display = 'none'
              }}
            />
          </div>
          <p
            style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#fde68a',
              marginBottom: '8px',
            }}
          >
            Accordatore di Ombre
          </p>
          <p
            style={{
              fontSize: '0.85rem',
              lineHeight: '1.6',
              color: 'rgba(226, 232, 240, 0.8)',
            }}
          >
            Artefatto della Sala delle Frequenze — la prova che sai ascoltare davvero.
          </p>
        </div>

        {/* Email notification */}
        <div
          style={{
            marginBottom: '28px',
            padding: '16px',
            background: 'rgba(103, 232, 249, 0.08)',
            border: '1px solid rgba(103, 232, 249, 0.2)',
            borderRadius: '12px',
          }}
        >
          <p
            style={{
              fontSize: '0.8rem',
              lineHeight: '1.6',
              color: 'rgba(224, 242, 254, 0.9)',
              textAlign: 'center',
            }}
          >
            📧 Andrea ti ha inviato una mail con i dettagli del gettone e del premio reale.
          </p>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={isClosing}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.15))',
            border: '1px solid rgba(212, 175, 55, 0.5)',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#fde68a',
            cursor: isClosing ? 'wait' : 'pointer',
            opacity: isClosing ? 0.75 : 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (isClosing) {
              return
            }
            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.25))'
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.7)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to bottom, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.15))'
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Continua → Sala delle Ombre
        </button>
      </div>
    </div>
  )
}
