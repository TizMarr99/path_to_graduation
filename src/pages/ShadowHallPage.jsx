import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerState } from '../hooks/usePlayerState'

const shadowSlots = [
  { id: 'musica',              categoryId: 'musica',                label: 'Sala delle Frequenze', x: '8%',  y: '25%', w: '14%', h: '55%' },
  { id: 'film-serie',          categoryId: 'film-serie',            label: 'Sala Film / Serie TV', x: '24%', y: '18%', w: '14%', h: '60%' },
  { id: 'cura-corpo',          categoryId: 'cura-corpo',            label: 'Sala Cura del Corpo',  x: '43%', y: '15%', w: '14%', h: '62%' },
  { id: 'arte-mito',           categoryId: 'arte-mito-letteratura', label: 'Arte / Mito / Lett.',  x: '62%', y: '18%', w: '14%', h: '60%' },
  { id: 'crittografia-logica', categoryId: 'crittografia-logica',   label: 'Crittografia / Logica', x: '78%', y: '25%', w: '14%', h: '55%' },
]

function ShadowSlot({ slot, unlocked, prizeWon, dailyBlocked, onNavigate }) {
  const isClickable = unlocked && !dailyBlocked

  function handleClick() {
    if (isClickable) {
      onNavigate(`/play/${slot.categoryId}`)
    }
  }

  // Locked slots: invisible, no interaction
  if (!unlocked) {
    return (
      <div
        style={{
          position: 'absolute',
          left: slot.x,
          top: slot.y,
          width: slot.w,
          height: slot.h,
          cursor: 'default',
          pointerEvents: 'none',
        }}
      />
    )
  }

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={slot.label}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() } : undefined}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: slot.x,
        top: slot.y,
        width: slot.w,
        height: slot.h,
        cursor: isClickable ? 'pointer' : 'default',
      }}
      className="group"
    >
      {/* Pulsing golden border */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '6px',
          border: '1px solid rgba(212,175,55,0.55)',
          animation: 'shadowGlowPulse 2.8s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Hover brightness overlay */}
      {isClickable && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '6px',
            background: 'rgba(255,255,255,0)',
            transition: 'background 0.25s ease',
            pointerEvents: 'none',
          }}
          className="group-hover:!bg-white/[0.07]"
        />
      )}

      {/* Label badge at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
            color: '#fde68a',
            textShadow: '0 0 10px rgba(212,175,55,0.9)',
            lineHeight: 1.3,
            marginBottom: '4px',
          }}
        >
          {slot.label}
        </p>

        {dailyBlocked ? (
          <p
            style={{
              fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
              color: 'rgba(253,230,138,0.6)',
            }}
          >
            🔒 Hai finito i tentativi per oggi
          </p>
        ) : (
          <p
            style={{
              fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
              color: 'rgba(253,230,138,0.85)',
              letterSpacing: '0.05em',
            }}
          >
            ▶ Entra
          </p>
        )}
      </div>

      {/* Prize won badge */}
      {prizeWon && (
        <div
          style={{
            position: 'absolute',
            top: '6%',
            right: '8%',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: 'clamp(0.8rem, 1.2vw, 1rem)',
              animation: 'shadowSparkle 2.4s ease-in-out infinite',
              filter: 'drop-shadow(0 0 6px rgba(253,230,138,0.9))',
            }}
            title="Ombra sconfitta"
          >
            ✦
          </span>
        </div>
      )}
    </div>
  )
}

export default function ShadowHallPage() {
  const { playerState, canAttemptQuiz } = usePlayerState()
  const { unlockedCategoryIds, roomProgress } = playerState
  const navigate = useNavigate()
  const dailyBlocked = !canAttemptQuiz()
  const bgAudioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio('/audio/shadow-hall-ambient.mp3')
    audio.loop = true
    audio.volume = 0.28
    bgAudioRef.current = audio
    void audio.play().catch(() => {})

    return () => {
      audio.pause()
      audio.src = ''
      bgAudioRef.current = null
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/shadow-room.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.30)',
        }}
      />

      {/* Slot container */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {shadowSlots.map((slot) => {
          const unlocked = unlockedCategoryIds.includes(slot.categoryId)
          const prizeWon = roomProgress[slot.categoryId]?.prizeWon === true

          return (
            <ShadowSlot
              key={slot.id}
              slot={slot}
              unlocked={unlocked}
              prizeWon={prizeWon}
              dailyBlocked={dailyBlocked}
              onNavigate={navigate}
            />
          )
        })}
      </div>

      {/* Top navigation bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontSize: 'clamp(0.65rem, 1.1vw, 0.8rem)',
            fontWeight: 600,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(251,191,36,0.8)',
          }}
        >
          La Sala delle Ombre
        </p>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(2,6,23,0.7)',
            border: '1px solid rgba(100,116,139,0.45)',
            borderRadius: '999px',
            padding: '6px 18px',
            fontSize: '0.75rem',
            color: 'rgba(203,213,225,0.9)',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(103,232,249,0.5)'
            e.currentTarget.style.color = '#e0f2fe'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(100,116,139,0.45)'
            e.currentTarget.style.color = 'rgba(203,213,225,0.9)'
          }}
        >
          ← Indietro
        </button>
      </div>

      {/* Sparkle keyframe */}
      <style>{`
        @keyframes shadowSparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          33%       { opacity: 0.65; transform: scale(1.25) rotate(20deg); }
          66%       { opacity: 0.9;  transform: scale(0.9) rotate(-10deg); }
        }
        @keyframes shadowGlowPulse {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(212,175,55,0.25); border-color: rgba(212,175,55,0.45); }
          50%      { box-shadow: 0 0 22px 6px rgba(212,175,55,0.55); border-color: rgba(212,175,55,0.85); }
        }
      `}</style>
    </div>
  )
}
