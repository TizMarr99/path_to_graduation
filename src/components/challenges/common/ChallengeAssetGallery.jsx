import { useState } from 'react'

const assetLabels = {
  image: 'Immagine',
  audio: 'Audio',
  video: 'Video',
}

function ChallengeAssetGallery({ assets = [], onAudioPlay }) {
  const [expandedAsset, setExpandedAsset] = useState(null)

  if (!assets.length) {
    return null
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {assets.map((asset, index) => {
          const assetId = asset.id ?? `${asset.kind}-${index}`

          return (
            <figure
              key={assetId}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
            >
              <figcaption className="border-b border-slate-800 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-slate-400">
                {assetLabels[asset.kind] ?? 'Asset'}
              </figcaption>

              <div className="px-4 py-4">
                {asset.kind === 'image' ? (
                  <button
                    className="block w-full"
                    onClick={() => setExpandedAsset(asset)}
                    type="button"
                  >
                    <img
                      alt={asset.alt ?? ''}
                      className="h-56 w-full rounded-xl object-cover transition hover:scale-[1.01]"
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

      {expandedAsset ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-6" role="dialog">
          <div className="max-w-5xl space-y-4">
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
              className="max-h-[80vh] w-full rounded-3xl object-contain"
              src={expandedAsset.src}
            />
            {expandedAsset.caption ? (
              <p className="text-center text-sm leading-6 text-slate-300">{expandedAsset.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}

export default ChallengeAssetGallery