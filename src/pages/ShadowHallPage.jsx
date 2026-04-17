import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerState } from '../hooks/usePlayerState'

const shadowSlots = [
  { id: 'musica',              categoryId: 'musica',                label: 'Sala delle Frequenze', x: '8%',    y: '25%', w: '14%', h: '55%', accent: 'amber' },
  { id: 'cura-corpo',          categoryId: 'cura-corpo',            label: 'Sala Cura del Corpo',  x: '43%',   y: '15%', w: '14%', h: '62%', accent: 'amber' },
  { id: 'arte-mito',           categoryId: 'arte-mito-letteratura', label: 'Arte / Mito / Lett.',  x: '62%',   y: '18%', w: '14%', h: '60%', accent: 'amber' },
  { id: 'crittografia-logica', categoryId: 'crittografia-logica',   label: 'Crittografia / Logica', x: '78%',  y: '25%', w: '14%', h: '55%', accent: 'amber' },
]

const slotThemes = {
  amber: {
    border: 'rgba(212,175,55,0.55)',
    borderStrong: 'rgba(212,175,55,0.75)',
    glow: 'rgba(212,175,55,0.55)',
    glowStrong: 'rgba(212,175,55,0.75)',
    label: '#fde68a',
    labelSoft: 'rgba(253,230,138,0.85)',
    muted: 'rgba(253,230,138,0.6)',
    revealOverlay: 'rgba(255,255,255,0.07)',
    lockedOverlay: 'rgba(2,6,23,0.26)',
  },
  cyan: {
    border: 'rgba(103,232,249,0.5)',
    borderStrong: 'rgba(103,232,249,0.7)',
    glow: 'rgba(103,232,249,0.42)',
    glowStrong: 'rgba(103,232,249,0.62)',
    label: '#67e8f9',
    labelSoft: 'rgba(224,242,254,0.88)',
    muted: 'rgba(186,230,253,0.7)',
    revealOverlay: 'rgba(103,232,249,0.12)',
    lockedOverlay: 'rgba(2,6,23,0.34)',
  },
}

function ShadowSlot({
  slot,
  visible,
  unlocked,
  prizeWon,
  dailyBlocked,
  onNavigate,
  staticBright = false,
  revealCost = null,
  scoreLabel = null,
}) {
  const isClickable = unlocked && !dailyBlocked
  const isRevealOnly = visible && !unlocked
  const theme = slotThemes[slot.accent] ?? slotThemes.amber

  function handleClick() {
    if (isClickable) {
      onNavigate(`/play/${slot.categoryId}`)
    }
  }

  if (!visible) {
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

  const frameBorder = prizeWon
    ? `2px solid ${theme.borderStrong}`
    : `1px solid ${isRevealOnly ? theme.borderStrong : theme.border}`
  const frameAnimation = staticBright || isRevealOnly
    ? undefined
    : prizeWon
      ? 'shadowGlowPulseCompleted 2.8s ease-in-out infinite'
      : 'shadowGlowPulse 2.8s ease-in-out infinite'
  const frameShadow = staticBright
    ? `0 0 24px 6px ${theme.glow}`
    : isRevealOnly
      ? `0 0 28px 6px ${theme.glow}`
      : undefined
  const brightOverlayBackground = staticBright
    ? theme.revealOverlay
    : isRevealOnly
      ? theme.lockedOverlay
      : 'rgba(255,255,255,0)'

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
          border: frameBorder,
          animation: frameAnimation,
          boxShadow: frameShadow,
          pointerEvents: 'none',
        }}
      />

      {/* Static/reveal brightness overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '6px',
          background: brightOverlayBackground,
          transition: 'background 0.25s ease',
          pointerEvents: 'none',
        }}
        className={!staticBright && isClickable ? 'group-hover:!bg-white/[0.07]' : undefined}
      />

      {isRevealOnly && (
        <div
          style={{
            position: 'absolute',
            top: '14%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(1.05rem, 1.9vw, 1.6rem)',
              marginBottom: '8px',
              filter: 'drop-shadow(0 0 10px rgba(103,232,249,0.35))',
            }}
          >
            🔒
          </div>
          {typeof revealCost === 'number' ? (
            <div
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(103,232,249,0.15)',
                border: '1px solid rgba(103,232,249,0.35)',
                color: '#67e8f9',
                fontSize: 'clamp(0.58rem, 0.82vw, 0.68rem)',
                fontWeight: '600',
              }}
            >
              {revealCost} 🪙
            </div>
          ) : null}
        </div>
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
            src="/images/rooms/music-artifact-no-bg.png"
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
            color: theme.label,
            textShadow: prizeWon
              ? `0 0 14px ${theme.glowStrong}`
              : `0 0 10px ${theme.glow}`,
            lineHeight: 1.3,
            marginBottom: '4px',
            fontWeight: prizeWon ? '600' : '400',
          }}
        >
          {slot.label}
        </p>

        {scoreLabel && (
          <p
            style={{
              fontSize: 'clamp(0.5rem, 0.8vw, 0.62rem)',
              color: theme.labelSoft,
              marginBottom: '4px',
              letterSpacing: '0.05em',
            }}
          >
            {scoreLabel}
          </p>
        )}

        {dailyBlocked ? (
          <p
            style={{
              fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
              color: theme.muted,
            }}
          >
            🔒 Hai finito i tentativi per oggi
          </p>
        ) : isRevealOnly ? (
          <p
            style={{
              fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
              color: theme.labelSoft,
              letterSpacing: '0.05em',
            }}
          >
            Sblocco disponibile
          </p>
        ) : (
          <p
            style={{
              fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
              color: theme.labelSoft,
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

  const musicProgress = roomProgress['musica']
  const activeMusicSession = playerState.activeSession?.categoryId === 'musica'
    ? playerState.activeSession
    : null
  const hasUnlockedMusicByScore =
    (activeMusicSession?.sessionCorrectCount ?? 0) >= 8 ||
    musicProgress?.unlockedByScore === true ||
    musicProgress?.prizeWon === true

  // Count music challenges completed across all sessions
  const musicChallengesCompleted =
    musicProgress?.sessions?.reduce(
      (total, session) => total + (session.correctCount || 0) + (session.wrongCount || 0),
      0
    ) || 0
  const isMusicRoomFullyCompleted = musicChallengesCompleted >= 12

  // Serie-film card appears when music room is passed (8+ correct) or fully completed
  const hasSeriesFilmReveal = hasUnlockedMusicByScore || isMusicRoomFullyCompleted

  // Best session score for music room (for display)
  const musicBestCorrect = musicProgress?.sessions?.reduce(
    (best, session) => Math.max(best, session.correctCount || 0), 0
  ) || 0
  const musicBestWrong = musicProgress?.sessions?.reduce(
    (best, session) => {
      if ((session.correctCount || 0) === musicBestCorrect) return session.wrongCount || 0
      return best
    }, 0
  ) || 0
  const musicScoreLabel = musicProgress?.sessions?.length
    ? `✓ ${musicBestCorrect} · ✗ ${musicBestWrong}`
    : null

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
          const visible = unlocked
          const staticBright = slot.categoryId === 'musica' && hasUnlockedMusicByScore
          const scoreLabel = slot.categoryId === 'musica' ? musicScoreLabel : null

          return (
            <ShadowSlot
              key={slot.id}
              slot={slot}
              visible={visible}
              unlocked={unlocked}
              prizeWon={prizeWon}
              dailyBlocked={dailyBlocked}
              onNavigate={navigate}
              staticBright={staticBright}
              scoreLabel={scoreLabel}
            />
          )
        })}

        {/* Locked door for TV/Film room — appears after music room passed */}
        {hasSeriesFilmReveal && (
          <div
            style={{
              position: 'absolute',
              left: '24%',
              top: '18%',
              width: '14%',
              height: '55%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'not-allowed',
              zIndex: 12,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                  background: 'linear-gradient(to bottom, rgba(4, 12, 24, 0.48), rgba(11, 28, 45, 0.58))',
                  border: '2px solid rgba(96, 165, 250, 0.3)',
                borderRadius: '16px',
                  boxShadow: '0 0 24px rgba(37, 99, 235, 0.12), inset 0 0 18px rgba(2, 6, 23, 0.24)',
                  backdropFilter: 'blur(3px)',
                padding: '12px 8px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  marginBottom: '8px',
                }}
              >
                🔒
              </div>
              <h3
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(0.7rem, 1.2vw, 0.95rem)',
                  color: '#93c5fd',
                  marginBottom: '6px',
                  fontWeight: '600',
                  textShadow: '0 0 10px rgba(59, 130, 246, 0.22)',
                }}
              >
                Sala delle Serie TV & Film
              </h3>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  background: 'rgba(96, 165, 250, 0.12)',
                  border: '1px solid rgba(96, 165, 250, 0.28)',
                  borderRadius: '999px',
                  fontSize: 'clamp(0.6rem, 0.9vw, 0.75rem)',
                  color: '#bfdbfe',
                  fontWeight: '600',
                }}
              >
                Costo: 60 🪙
              </div>
              <p
                style={{
                  fontSize: 'clamp(0.58rem, 0.86vw, 0.72rem)',
                  color: 'rgba(219, 234, 254, 0.76)',
                  marginTop: '8px',
                  lineHeight: '1.35',
                  maxWidth: '14ch',
                }}
              >
                Prima completa i 12 quiz della sala precedente.
              </p>
            </div>
          </div>
        )}
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
