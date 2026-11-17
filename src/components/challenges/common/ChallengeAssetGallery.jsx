import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const assetLabels = {
  image: 'Immagine',
  audio: 'Audio',
  video: 'Video',
}

function ChallengeAssetGallery({ assets = [], onAudioPlay, imageClassName = '', onImageLoad, onImageError, zoomStatus, zoomContent, compact = false }) {
  const [expandedAsset, setExpandedAsset] = useState(null)
  useEffect(() => {
    if (!expandedAsset) return
    function closeOnEscape(event) {
      if (event.key === 'Escape') setExpandedAsset(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [expandedAsset])
  const isSingleAsset = assets.length === 1

  if (!assets.length) {
    return null
  }

  return (
    <>
      <div className={[
        'grid gap-4',
        isSingleAsset ? 'grid-cols-1' : 'md:grid-cols-2',
      ].join(' ')}>
        {assets.map((asset, index) => {
          const assetId = asset.id ?? `${asset.kind}-${index}`

          return (
            <figure
              key={assetId}
              className={[
                compact ? 'w-full overflow-hidden rounded-2xl' : 'w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70',
                isSingleAsset ? 'mx-auto' : '',
              ].join(' ')}
            >
              {!compact ? <figcaption className="border-b border-slate-800 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-slate-400">
                {assetLabels[asset.kind] ?? 'Asset'}
              </figcaption> : null}

              <div className={compact ? '' : 'px-4 py-4'}>
                {asset.kind === 'image' ? (
                  <button
                    className="block w-full"
                    onClick={(event) => { event.stopPropagation(); setExpandedAsset(asset) }}
                    type="button"
                  >
                    <img
                      alt={asset.alt ?? ''}
                      className={[
                        'w-full rounded-xl transition hover:scale-[1.01]',
                        imageClassName || 'h-44 bg-slate-950 object-contain sm:h-52',
                      ].join(' ')}
                      onLoad={() => onImageLoad?.(index)}
                      onError={onImageError}
                      src={asset.src}
                    />
                    <span className="mt-3 block text-left text-xs uppercase tracking-[0.24em] text-cyan-300/80">
                      Tocca per ingrandire
                    </span>
                  </button>
                ) : null}

                {asset.kind === 'audio' ? (
                  <audio className="w-full" controls onPlay={onAudioPlay} preload="metadata" src={asset.src} />
                ) : null}

                {asset.kind === 'video' ? (
                  <video
                    className="h-56 w-full rounded-xl object-cover"
                    controls
                    preload="metadata"
                    src={asset.src}
                  />
                ) : null}

                {asset.caption ? (
                  <p className="mt-3 text-sm leading-6 text-slate-300">{asset.caption}</p>
                ) : null}
              </div>
            </figure>
          )
        })}
      </div>

      {expandedAsset ? createPortal(
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/90 px-4 py-6" role="dialog" aria-modal="true" aria-label="Immagine ingrandita">
          <div className="max-h-full w-full max-w-5xl space-y-4 overflow-y-auto">
            {zoomStatus ? <p role="status" className="text-center text-amber-100">{zoomStatus}</p> : null}
            <div className="flex justify-end">
              <button
                className="rounded-full border border-slate-700 bg-slate-950/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-300/45 hover:text-cyan-100"
                onClick={() => setExpandedAsset(null)}
                type="button"
              >
                Chiudi
              </button>
            </div>
            <img
              alt={expandedAsset.alt ?? ''}
              className={`${zoomContent ? 'max-h-[55dvh]' : 'max-h-[75dvh]'} w-full rounded-3xl object-contain`}
              src={expandedAsset.src}
            />
            {zoomContent}
            {expandedAsset.caption ? (
              <p className="text-center text-sm leading-6 text-slate-300">{expandedAsset.caption}</p>
            ) : null}
          </div>
        </div>, document.body) : null}
    </>
  )
}

export default ChallengeAssetGallery
