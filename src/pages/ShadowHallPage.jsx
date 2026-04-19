import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerState } from '../hooks/usePlayerState'
import { getCategoryById } from '../lib/challengeData'
import { getRoomTransition } from '../lib/roomTransitions'

const shadowSlots = [
  { id: 'musica',              categoryId: 'musica',                label: 'Sala delle Frequenze', x: '8%',    y: '25%', w: '14%', h: '55%', accent: 'amber' },
  { id: 'serie-film',          categoryId: 'serie-film',            label: 'Sala delle Serie TV & Film', x: '24%', y: '18%', w: '14%', h: '55%', accent: 'cyan' },
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

const defeatedPortalImages = {
  musica: [
    '/images/rooms/musica-error1.png',
    '/images/rooms/musica-error2.png',
    '/images/rooms/musica-error4.png',
  ],
}

function resolvePortalScoreLabel(progress, activeSession = null) {
  const hasStoredProgress = Boolean(progress?.lastCompletedSession) || (progress?.sessions?.length ?? 0) > 0

  if (!activeSession && !hasStoredProgress) {
    return null
  }

  const scoreSource = activeSession
    ? {
        correctCount: activeSession.sessionCorrectCount ?? 0,
        wrongCount: activeSession.sessionWrongCount ?? 0,
      }
    : progress?.lastCompletedSession ?? progress?.sessions?.at(-1) ?? null

  if (!scoreSource) {
    return null
  }

  const correctCount = scoreSource.correctCount ?? scoreSource.sessionCorrectCount ?? 0
  const wrongCount = scoreSource.wrongCount ?? scoreSource.sessionWrongCount ?? 0

  return `✓ ${correctCount} · ✗ ${wrongCount}`
}

function resolvePortalOutcome(progress, activeSession = null) {
  const scoreSource = activeSession
    ? {
        correctCount: activeSession.sessionCorrectCount ?? 0,
        wrongCount: activeSession.sessionWrongCount ?? 0,
      }
    : progress?.lastCompletedSession ?? progress?.sessions?.at(-1) ?? null

  if (!scoreSource) {
    return null
  }

  return {
    correctCount: scoreSource.correctCount ?? scoreSource.sessionCorrectCount ?? 0,
    wrongCount: scoreSource.wrongCount ?? scoreSource.sessionWrongCount ?? 0,
  }
}

function resolveDefeatedPortalImage(categoryId, outcome) {
  const categoryImages = defeatedPortalImages[categoryId] ?? []

  if (!categoryImages.length || !outcome) {
    return null
  }

  const imageIndex = Math.max(0, (outcome.wrongCount ?? 1) - 1) % categoryImages.length
  return categoryImages[imageIndex]
}

function ShadowSlot({
  slot,
  visible,
  unlocked,
  prizeWon,
  defeated,
  defeatedImageSrc = null,
  dailyBlocked,
  onNavigate,
  onRevealRequest,
  staticBright = false,
  revealCost = null,
  scoreLabel = null,
}) {
  const isClickable = unlocked && !dailyBlocked
  const isRevealOnly = visible && !unlocked
  const canReveal = isRevealOnly && typeof onRevealRequest === 'function'
  const isInteractive = isClickable || canReveal
  const theme = slotThemes[slot.accent] ?? slotThemes.amber

  function handleClick() {
    if (isClickable) {
      onNavigate(`/play/${slot.categoryId}`)
      return
    }

    if (canReveal) {
      onRevealRequest(slot.categoryId)
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
    : defeated
      ? '1px solid rgba(71, 85, 105, 0.78)'
      : `1px solid ${isRevealOnly ? theme.borderStrong : theme.border}`
  const frameAnimation = staticBright || isRevealOnly || defeated
    ? undefined
    : prizeWon
      ? 'shadowGlowPulseCompleted 2.8s ease-in-out infinite'
      : 'shadowGlowPulse 2.8s ease-in-out infinite'
  const frameShadow = staticBright
    ? `0 0 24px 6px ${theme.glow}`
    : defeated
      ? '0 0 18px rgba(0, 0, 0, 0.62), 0 0 34px rgba(0, 0, 0, 0.42), inset 0 0 26px rgba(0, 0, 0, 0.68)'
    : isRevealOnly
      ? `0 0 28px 6px ${theme.glow}`
      : undefined
  const brightOverlayBackground = staticBright
    ? theme.revealOverlay
    : defeated
      ? 'linear-gradient(180deg, rgba(2,6,23,0.28), rgba(2,6,23,0.58))'
    : isRevealOnly
      ? theme.lockedOverlay
      : 'rgba(255,255,255,0)'

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={slot.label}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() } : undefined}
      onClick={handleClick}
      style={{
        position: 'absolute',
        left: slot.x,
        top: slot.y,
        width: slot.w,
        height: slot.h,
        cursor: isInteractive ? 'pointer' : 'default',
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
        className={!staticBright && isInteractive ? 'group-hover:!bg-white/[0.07]' : undefined}
      />

      {defeated && defeatedImageSrc ? (
        <div
          style={{
            position: 'absolute',
            top: '11%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <img
            src={defeatedImageSrc}
            alt="Eco dell'ombra"
            style={{
              width: 'clamp(40px, 6.4vw, 62px)',
              height: 'clamp(40px, 6.4vw, 62px)',
              objectFit: 'cover',
              borderRadius: '10px',
              border: '1px solid rgba(148, 163, 184, 0.38)',
              opacity: 0.78,
              filter: 'grayscale(0.18) brightness(0.7) drop-shadow(0 0 10px rgba(2,6,23,0.7))',
            }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      ) : null}

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
            color: defeated ? 'rgba(203, 213, 225, 0.82)' : theme.label,
            textShadow: defeated
              ? '0 0 10px rgba(2,6,23,0.75)'
              : prizeWon
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
              color: defeated ? 'rgba(148, 163, 184, 0.86)' : theme.labelSoft,
              marginBottom: '4px',
              letterSpacing: '0.05em',
            }}
          >
            {scoreLabel}
          </p>
        )}

        {isRevealOnly ? (
          <p
            style={{
              fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
              color: theme.labelSoft,
              letterSpacing: '0.05em',
            }}
          >
            {dailyBlocked ? 'Sblocca oggi · entra domani' : 'Sblocco disponibile'}
          </p>
        ) : defeated ? null : dailyBlocked ? (
          <p
            style={{
              fontSize: 'clamp(0.55rem, 0.85vw, 0.65rem)',
              color: defeated ? 'rgba(148, 163, 184, 0.78)' : theme.muted,
            }}
          >
            🔒 Torna domani
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
  const {
    buyRoomAccess,
    canAttemptQuiz,
    clearPendingBridge,
    getCredits,
    playerState,
  } = usePlayerState()
  const { unlockedCategoryIds, roomProgress } = playerState
  const navigate = useNavigate()
  const dailyBlocked = !canAttemptQuiz()
  const bgAudioRef = useRef(null)
  const pendingBridge = playerState.transitionState?.pendingBridge ?? null
  const pendingTargetCategory = pendingBridge ? getCategoryById(pendingBridge.targetCategoryId) : null
  const pendingSourceTransition = pendingBridge ? getRoomTransition(pendingBridge.sourceCategoryId) : null
  const credits = getCredits()
  const pendingRoomCost = pendingTargetCategory?.buyAccessCost ?? 0
  const hasCreditsForPendingRoom = credits >= pendingRoomCost
  const [purchaseModalBridgeKey, setPurchaseModalBridgeKey] = useState(null)

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
  const activeBridgeKey = pendingBridge?.bridgeCompletedAt
    ? `${pendingBridge.sourceCategoryId}:${pendingBridge.targetCategoryId}:${pendingBridge.bridgeCompletedAt}`
    : null
  const isPurchaseModalOpen =
    purchaseModalBridgeKey !== null &&
    purchaseModalBridgeKey === activeBridgeKey &&
    Boolean(pendingBridge?.bridgeCompletedAt) &&
    Boolean(pendingTargetCategory) &&
    !unlockedCategoryIds.includes(pendingTargetCategory?.id)

  useEffect(() => {
    if (pendingBridge && !pendingBridge.bridgeCompletedAt) {
      navigate('/bridge', { replace: true })
    }
  }, [navigate, pendingBridge])

  useEffect(() => {
    if (
      pendingBridge?.targetCategoryId &&
      unlockedCategoryIds.includes(pendingBridge.targetCategoryId)
    ) {
      clearPendingBridge(pendingBridge.targetCategoryId)
    }
  }, [clearPendingBridge, pendingBridge, unlockedCategoryIds])

  function handlePendingRoomPurchase() {
    if (!pendingBridge || !pendingTargetCategory) {
      return
    }

    const cost = pendingTargetCategory.buyAccessCost ?? 0
    const purchaseSucceeded = buyRoomAccess(pendingTargetCategory.id, cost)

    if (!purchaseSucceeded) {
      return
    }

    setPurchaseModalBridgeKey(null)

    if (canAttemptQuiz()) {
      navigate(`/play/${pendingTargetCategory.id}`)
    }
  }

  function handleRevealRequest(categoryId) {
    if (
      pendingBridge?.bridgeCompletedAt &&
      pendingTargetCategory?.id === categoryId &&
      !unlockedCategoryIds.includes(categoryId) &&
      hasCreditsForPendingRoom
    ) {
      setPurchaseModalBridgeKey(activeBridgeKey)
    }
  }

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
          const slotProgress = roomProgress[slot.categoryId] ?? null
          const prizeWon = slotProgress?.prizeWon === true
          const activeSessionForSlot = playerState.activeSession?.categoryId === slot.categoryId
            ? playerState.activeSession
            : null
          const slotOutcome = resolvePortalOutcome(slotProgress, activeSessionForSlot)
          const defeated =
            unlocked &&
            !prizeWon &&
            !activeSessionForSlot &&
            Boolean(slotProgress?.buyAccessAvailable || slotProgress?.lastCompletedSession)
          const visible = slot.categoryId === 'serie-film'
            ? unlocked || hasSeriesFilmReveal
            : unlocked
          const staticBright = slot.categoryId === 'musica' && hasUnlockedMusicByScore
          const scoreLabel = resolvePortalScoreLabel(slotProgress, activeSessionForSlot)
          const defeatedImageSrc = defeated
            ? resolveDefeatedPortalImage(slot.categoryId, slotOutcome)
            : null
          const slotCategory = getCategoryById(slot.categoryId)
          const revealCost = !unlocked ? slotCategory?.buyAccessCost ?? null : null
          const canOpenRevealModal =
            pendingBridge?.bridgeCompletedAt &&
            pendingTargetCategory?.id === slot.categoryId &&
            !unlocked &&
            hasCreditsForPendingRoom

          return (
            <ShadowSlot
              key={slot.id}
              slot={slot}
              visible={visible}
              unlocked={unlocked}
              prizeWon={prizeWon}
              defeated={defeated}
              defeatedImageSrc={defeatedImageSrc}
              dailyBlocked={dailyBlocked}
              onNavigate={navigate}
              onRevealRequest={canOpenRevealModal ? handleRevealRequest : undefined}
              staticBright={staticBright}
              revealCost={revealCost}
              scoreLabel={scoreLabel}
            />
          )
        })}
      </div>

      {pendingBridge?.bridgeCompletedAt && pendingTargetCategory && !unlockedCategoryIds.includes(pendingTargetCategory.id) && hasCreditsForPendingRoom && isPurchaseModalOpen ? (
        <div
          onClick={() => setPurchaseModalBridgeKey(null)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 14,
            background: 'rgba(2, 6, 23, 0.58)',
            backdropFilter: 'blur(6px)',
          }}
        />
      ) : null}

      {pendingBridge?.bridgeCompletedAt && pendingTargetCategory && !unlockedCategoryIds.includes(pendingTargetCategory.id) && hasCreditsForPendingRoom && isPurchaseModalOpen ? (
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(720px, calc(100vw - 40px))',
            zIndex: 15,
            borderRadius: '24px',
            border: '1px solid rgba(96, 165, 250, 0.28)',
            background: 'linear-gradient(180deg, rgba(3, 7, 18, 0.86), rgba(15, 23, 42, 0.9))',
            boxShadow: '0 0 32px rgba(37, 99, 235, 0.16)',
            backdropFilter: 'blur(14px)',
            padding: '20px 22px',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(191, 219, 254, 0.82)',
            }}
          >
            {pendingSourceTransition?.bridgeNarrative?.eyebrow ?? 'Passaggio aperto'}
          </p>
          <h2
            style={{
              marginTop: '10px',
              fontSize: 'clamp(1.2rem, 2.4vw, 1.7rem)',
              color: '#eff6ff',
              fontWeight: '600',
            }}
          >
            {pendingSourceTransition?.purchasePrompt?.title ?? 'La Soglia di Mezzo e pronta.'}
          </h2>
          <p
            style={{
              marginTop: '12px',
              color: 'rgba(219, 234, 254, 0.82)',
              lineHeight: 1.65,
              fontSize: '0.95rem',
            }}
          >
            {dailyBlocked
              ? pendingSourceTransition?.purchasePrompt?.blockedDescription
              : pendingSourceTransition?.purchasePrompt?.description}
          </p>
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                color: 'rgba(191, 219, 254, 0.92)',
                fontSize: '0.9rem',
              }}
            >
              <span>{pendingTargetCategory.title}</span>
              <span>Costo: {pendingTargetCategory.buyAccessCost ?? 0} 🪙</span>
              <span>Crediti disponibili: {credits} 🪙</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setPurchaseModalBridgeKey(null)}
                style={{
                  borderRadius: '999px',
                  border: '1px solid rgba(148, 163, 184, 0.32)',
                  background: 'rgba(15, 23, 42, 0.62)',
                  color: 'rgba(226, 232, 240, 0.92)',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
                type="button"
              >
                Annulla
              </button>
              <button
                disabled={!hasCreditsForPendingRoom}
                onClick={handlePendingRoomPurchase}
                style={{
                  borderRadius: '999px',
                  border: '1px solid rgba(147, 197, 253, 0.42)',
                  background: !hasCreditsForPendingRoom
                    ? 'rgba(30, 41, 59, 0.55)'
                    : 'rgba(96, 165, 250, 0.14)',
                  color: !hasCreditsForPendingRoom
                    ? 'rgba(148, 163, 184, 0.85)'
                    : '#eff6ff',
                  padding: '10px 18px',
                  cursor: !hasCreditsForPendingRoom ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                }}
                type="button"
              >
                {pendingSourceTransition?.purchasePrompt?.actionLabel ?? 'Acquista l’accesso'}
              </button>
            </div>
          </div>
          {dailyBlocked ? (
            <p
              style={{
                marginTop: '12px',
                color: 'rgba(191, 219, 254, 0.76)',
                fontSize: '0.86rem',
                lineHeight: 1.5,
              }}
            >
              Se acquisti adesso, l’ingresso effettivo restera sospeso fino a domani.
            </p>
          ) : null}
        </div>
      ) : null}

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
