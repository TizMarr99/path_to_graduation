const assetLabels = {
  image: 'Immagine',
  audio: 'Audio',
  video: 'Video',
}

function ChallengeAssetGallery({ assets = [] }) {
  if (!assets.length) {
    return null
  }

  return (
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
                <img
                  alt={asset.alt ?? ''}
                  className="h-56 w-full rounded-xl object-cover"
                  src={asset.src}
                />
              ) : null}

              {asset.kind === 'audio' ? (
                <audio className="w-full" controls preload="metadata" src={asset.src} />
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
  )
}

export default ChallengeAssetGallery