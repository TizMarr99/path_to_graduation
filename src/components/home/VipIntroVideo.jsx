import { useEffect, useRef } from 'react'

function VipIntroVideo({ isLeaving, onEnded }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = false
    const playPromise = video.play()

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay with audio blocked — fall back to muted
        video.muted = true
        void video.play().catch(() => {})
      })
    }
  }, [])

  return (
    <section
      className={[
        'relative min-h-screen overflow-hidden bg-black text-amber-50 transition duration-700 ease-out',
        isLeaving ? 'opacity-0 scale-[1.01]' : 'opacity-100 scale-100',
      ].join(' ')}
    >
      <img
        alt="Hall della galleria"
        className="absolute inset-0 h-full w-full object-cover"
        src="/images/hall-gallery.png"
      />

      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full bg-black object-contain"
        muted
        onEnded={onEnded}
        playsInline
        preload="auto"
        src="/videos/porte-gallery.mp4"
      />

      <div className="absolute inset-0 bg-black/24" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_42%,rgba(0,0,0,0.6)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-8 sm:pb-10">
        <button
          className="inline-flex items-center justify-center rounded-full border border-amber-300/38 bg-black/45 px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-amber-100 transition hover:border-amber-200/55 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
          onClick={onEnded}
          type="button"
        >
          Salta intro
        </button>
      </div>

      <div className="absolute right-5 top-5 rounded-full border border-amber-300/30 bg-black/35 p-3 shadow-[0_0_30px_rgba(212,175,55,0.08)] backdrop-blur-md sm:right-8 sm:top-8 sm:p-4">
        <img
          alt="VIP"
          className="h-12 w-auto sm:h-14"
          src="/images/logo-vip.png"
        />
      </div>
    </section>
  )
}

export default VipIntroVideo