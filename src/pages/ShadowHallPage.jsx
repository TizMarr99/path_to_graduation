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
      {/* Enhanced border for completed rooms */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '6px',
          border: prizeWon
            ? '2px solid rgba(212,175,55,0.75)'
            : '1px solid rgba(212,175,55,0.55)',
          animation: prizeWon
            ? 'shadowGlowPulseCompleted 2.8s ease-in-out infinite'
            : 'shadowGlowPulse 2.8s ease-in-out infinite',
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

      {/* Artifact icon for music room */}
      {prizeWon && slot.categoryId === 'musica' && (
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <img
            src="/images/music-artifact-no-bg.png"
            alt="Accordatore di Ombre"
            style={{
              width: 'clamp(32px, 5vw, 48px)',
              height: 'clamp(32px, 5vw, 48px)',
              filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.9))',
              animation: 'artifactFloat 3s ease-in-out infinite',
            }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
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
            color: prizeWon ? '#fde68a' : '#fde68a',
            textShadow: prizeWon
              ? '0 0 14px rgba(212,175,55,1)'
              : '0 0 10px rgba(212,175,55,0.9)',
            lineHeight: 1.3,
            marginBottom: '4px',
            fontWeight: prizeWon ? '600' : '400',
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

      {/* Prize won badge (sparkle) */}
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

  // Check if music room has all 12 challenges completed
  const musicProgress = roomProgress['musica']
  const musicSessionsCompleted = musicProgress?.sessions?.length || 0
  const musicChallengesCompleted =
    musicProgress?.sessions?.reduce(
      (total, session) => total + (session.correctCount || 0) + (session.wrongCount || 0),
      0
    ) || 0
  const isMusicRoomFullyCompleted = musicChallengesCompleted >= 12

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

      <div
        style={{
          position: 'absolute',
          top: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 11,
          maxWidth: 'min(40rem, calc(100vw - 112px))',
          padding: '10px 22px',
          borderRadius: '999px',
          border: '1px solid rgba(252,211,77,0.66)',
          background: 'rgba(2,6,23,0.34)',
          boxShadow: '0 0 24px rgba(212,175,55,0.18)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 'clamp(0.72rem, 1.1vw, 0.82rem)',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,248,220,0.92)',
            textShadow: '0 0 12px rgba(0,0,0,0.32)',
            lineHeight: 1.45,
          }}
        >
          Ogni ombra cela una voce. Avvicinati per sentirla.
        </p>
      </div>

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

        {/* New locked door for TV/Film room */}
        <div
          style={{
            position: 'absolute',
            bottom: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(240px, 30vw, 360px)',
            padding: '20px',
            background: 'linear-gradient(to bottom, rgba(2, 6, 23, 0.85), rgba(15, 23, 42, 0.85))',
            border: isMusicRoomFullyCompleted
              ? '2px solid rgba(103, 232, 249, 0.5)'
              : '2px solid rgba(100, 116, 139, 0.4)',
            borderRadius: '16px',
            boxShadow: isMusicRoomFullyCompleted
              ? '0 0 30px rgba(103, 232, 249, 0.2)'
              : '0 0 20px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            opacity: isMusicRoomFullyCompleted ? 0.95 : 0.75,
            transition: 'all 0.3s ease',
            cursor: isMusicRoomFullyCompleted ? 'default' : 'not-allowed',
            zIndex: 12,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                marginBottom: '12px',
                filter: isMusicRoomFullyCompleted
                  ? 'grayscale(0%)'
                  : 'grayscale(70%) opacity(0.6)',
              }}
            >
              {isMusicRoomFullyCompleted ? '🎭' : '🔒'}
            </div>
            <h3
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)',
                color: isMusicRoomFullyCompleted ? '#67e8f9' : 'rgba(203, 213, 225, 0.6)',
                marginBottom: '8px',
                fontWeight: '600',
                textShadow: isMusicRoomFullyCompleted
                  ? '0 0 12px rgba(103, 232, 249, 0.4)'
                  : 'none',
              }}
            >
              Sala delle Serie TV & Film
            </h3>
            <p
              style={{
                fontSize: 'clamp(0.7rem, 1vw, 0.8rem)',
                color: isMusicRoomFullyCompleted
                  ? 'rgba(224, 242, 254, 0.8)'
                  : 'rgba(148, 163, 184, 0.6)',
                marginBottom: '12px',
                lineHeight: '1.5',
              }}
            >
              {isMusicRoomFullyCompleted
                ? 'Prossima sala principale'
                : 'Completa tutte le 12 prove della Sala Musica'}
            </p>
            <div
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: isMusicRoomFullyCompleted
                  ? 'rgba(103, 232, 249, 0.15)'
                  : 'rgba(100, 116, 139, 0.2)',
                border: `1px solid ${
                  isMusicRoomFullyCompleted
                    ? 'rgba(103, 232, 249, 0.4)'
                    : 'rgba(100, 116, 139, 0.3)'
                }`,
                borderRadius: '999px',
                fontSize: 'clamp(0.7rem, 1vw, 0.8rem)',
                color: isMusicRoomFullyCompleted ? '#67e8f9' : 'rgba(148, 163, 184, 0.7)',
                fontWeight: '600',
              }}
            >
              Costo: 60 🪙
            </div>
            {!isMusicRoomFullyCompleted && (
              <p
                style={{
                  marginTop: '12px',
                  fontSize: 'clamp(0.65rem, 0.9vw, 0.75rem)',
                  color: 'rgba(148, 163, 184, 0.5)',
                  fontStyle: 'italic',
                }}
              >
                Progresso: {musicChallengesCompleted}/12
              </p>
            )}
          </div>
        </div>
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
          justifyContent: 'flex-end',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
          zIndex: 10,
        }}
      >
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
        @keyframes shadowGlowPulseCompleted {
          0%, 100% { box-shadow: 0 0 16px 4px rgba(212,175,55,0.45); border-color: rgba(212,175,55,0.65); }
          50%      { box-shadow: 0 0 32px 8px rgba(212,175,55,0.75); border-color: rgba(212,175,55,0.95); }
        }
        @keyframes artifactFloat {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%      { transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
