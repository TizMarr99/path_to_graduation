function resolveWonPrizeLabels(category, wonSubPrizeIds = []) {
  if (!Array.isArray(wonSubPrizeIds) || !wonSubPrizeIds.length) {
    return []
  }

  const prizeMap = new Map((category.subPrizes ?? []).map((prize) => [prize.id, prize.label]))
  return wonSubPrizeIds
    .map((prizeId) => prizeMap.get(prizeId) ?? prizeId)
    .filter(Boolean)
}

export default function SeriesFilmVictoryModal({
  category,
  onClose,
  sessionCorrectCount,
  sessionWrongCount,
  totalChallenges,
  wonSubPrizeIds = [],
}) {
  const guardian = category.characters?.guardian
  const inquisitor = category.characters?.inquisitor
  const wonPrizeLabels = resolveWonPrizeLabels(category, wonSubPrizeIds)

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
          border: '1px solid rgba(167, 139, 250, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 0 60px rgba(167, 139, 250, 0.2)',
          padding: '32px',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
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
            border: '1px solid rgba(167, 139, 250, 0.3)',
            borderRadius: '50%',
            color: 'rgba(196, 181, 253, 0.9)',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 1,
          }}
          type="button"
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#ddd6fe',
              textShadow: '0 0 20px rgba(167, 139, 250, 0.4)',
              marginBottom: '12px',
            }}
          >
            Sala delle Serie e dei Film Superata
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
                background: 'linear-gradient(to right, transparent, rgba(167, 139, 250, 0.65))',
              }}
            />
            <span
              style={{
                fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(196, 181, 253, 0.72)',
              }}
            >
              Artefatto ottenuto
            </span>
            <div
              style={{
                width: '40px',
                height: '2px',
                background: 'linear-gradient(to left, transparent, rgba(167, 139, 250, 0.65))',
              }}
            />
          </div>
        </div>

        {typeof sessionCorrectCount === 'number' ? (
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
            {typeof totalChallenges === 'number' && totalChallenges > (sessionCorrectCount + (sessionWrongCount ?? 0)) ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#94a3b8' }}>
                  {totalChallenges - sessionCorrectCount - (sessionWrongCount ?? 0)}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(148, 163, 184, 0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Restanti
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {guardian ? (
          <div
            style={{
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(196, 181, 253, 0.08)',
              border: '1px solid rgba(196, 181, 253, 0.25)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {guardian.imageSrc ? (
                <img
                  src={guardian.imageSrc}
                  alt={guardian.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid rgba(196, 181, 253, 0.5)',
                    objectFit: 'cover',
                  }}
                  onError={(event) => {
                    if (guardian.fallbackImageSrc && event.target.src !== guardian.fallbackImageSrc) {
                      event.target.src = guardian.fallbackImageSrc
                    }
                  }}
                />
              ) : null}
              <div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(196, 181, 253, 0.8)',
                    marginBottom: '2px',
                  }}
                >
                  {guardian.role || 'Il Guardiano'}
                </p>
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ddd6fe' }}>
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
              "Hai rimesso ordine dove c'erano solo frammenti. Questo fotogramma è la prova che sai vedere una storia intera anche quando prova a spezzarsi."
            </p>
          </div>
        ) : null}

        {inquisitor ? (
          <div
            style={{
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(248, 113, 113, 0.08)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {inquisitor.imageSrc ? (
                <img
                  src={inquisitor.imageSrc}
                  alt={inquisitor.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid rgba(248, 113, 113, 0.35)',
                    objectFit: 'cover',
                  }}
                  onError={(event) => {
                    if (inquisitor.fallbackImageSrc && event.target.src !== inquisitor.fallbackImageSrc) {
                      event.target.src = inquisitor.fallbackImageSrc
                    }
                  }}
                />
              ) : null}
              <div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'rgba(248, 113, 113, 0.75)',
                    marginBottom: '2px',
                  }}
                >
                  {inquisitor.role || "L'Inquisitore"}
                </p>
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fecaca' }}>
                  {inquisitor.name}
                </p>
              </div>
            </div>
            <p
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.95rem',
                lineHeight: '1.7',
                color: '#fee2e2',
                fontStyle: 'italic',
              }}
            >
              "Fastidioso, davvero. Sei riuscita a ricordare abbastanza da rovinare il mio spettacolo. Tieniti pure il tuo trofeo: non renderà meno irritante il fatto che tu abbia avuto ragione."
            </p>
          </div>
        ) : null}

        <div
          style={{
            marginBottom: '24px',
            padding: '24px',
            background: 'rgba(167, 139, 250, 0.12)',
            border: '2px solid rgba(167, 139, 250, 0.3)',
            borderRadius: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 16px auto',
              borderRadius: '20px',
              border: '1px solid rgba(216, 180, 254, 0.3)',
              background: 'linear-gradient(145deg, rgba(51, 65, 85, 0.55), rgba(15, 23, 42, 0.8))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.8rem',
              boxShadow: '0 0 20px rgba(167, 139, 250, 0.25)',
            }}
          >
            🎞️
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ddd6fe', marginBottom: '8px' }}>
            {category.rewardArtifact?.label || 'Fotogramma Maledetto'}
          </p>
          <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'rgba(226, 232, 240, 0.84)' }}>
            {category.rewardArtifact?.description || 'Un frammento ottenuto completando la sala.'}
          </p>
        </div>

        {wonPrizeLabels.length ? (
          <div
            style={{
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(103, 232, 249, 0.08)',
              border: '1px solid rgba(103, 232, 249, 0.2)',
              borderRadius: '12px',
            }}
          >
            <p
              style={{
                margin: '0 0 10px 0',
                fontSize: '0.8rem',
                lineHeight: '1.6',
                color: 'rgba(224, 242, 254, 0.92)',
                textAlign: 'center',
              }}
            >
              📧 Andrea ti ha inviato una mail con l'artefatto e una seconda mail con i premi reali sbloccati.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {wonPrizeLabels.map((label) => (
                <span
                  key={label}
                  style={{
                    borderRadius: '999px',
                    padding: '6px 10px',
                    background: 'rgba(125, 211, 252, 0.08)',
                    border: '1px solid rgba(125, 211, 252, 0.2)',
                    color: '#e0f2fe',
                    fontSize: '0.75rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              marginBottom: '24px',
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
                margin: 0,
              }}
            >
              📧 Andrea ti ha inviato la mail di superamento stanza con il Fotogramma Maledetto.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(to bottom, rgba(167, 139, 250, 0.22), rgba(167, 139, 250, 0.16))',
            border: '1px solid rgba(167, 139, 250, 0.45)',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#ddd6fe',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          type="button"
        >
          Continua il Quiz
        </button>
      </div>
    </div>
  )
}