const SPIDERS = [
  { x: '-20vw', y: '12vh', endX: '120vw', endY: '36vh', size: 84, duration: 2.3, delay: -0.4, angle: 90 },
  { x: '120vw', y: '72vh', endX: '-20vw', endY: '52vh', size: 110, duration: 2.8, delay: -1.2, angle: -90 },
  { x: '18vw', y: '120vh', endX: '42vw', endY: '-20vh', size: 72, duration: 2.5, delay: -0.8, angle: 0 },
  { x: '78vw', y: '-20vh', endX: '62vw', endY: '120vh', size: 96, duration: 3.1, delay: -1.6, angle: 180 },
  { x: '-20vw', y: '86vh', endX: '120vw', endY: '65vh', size: 120, duration: 3, delay: -1.9, angle: 90 },
  { x: '120vw', y: '20vh', endX: '-20vw', endY: '8vh', size: 80, duration: 2.6, delay: -0.2, angle: -90 },
]

export default function SpiderErrorOverlay({ src }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden select-none">
      <div className="spider-error-flash absolute inset-0 bg-red-700/40" />
      {SPIDERS.map((spider, index) => (
        <img
          key={index}
          alt=""
          draggable={false}
          src={src}
          className="spider-error-crawler absolute left-0 top-0 h-auto object-contain"
          style={{
            width: `clamp(96px, ${spider.size / 5}vw, ${spider.size * 2}px)`,
            '--spider-x': spider.x,
            '--spider-y': spider.y,
            '--spider-end-x': spider.endX,
            '--spider-end-y': spider.endY,
            '--spider-angle': `${spider.angle}deg`,
            animationDuration: `${spider.duration * 3}s`,
            animationDelay: `${spider.delay * 3}s`,
          }}
        />
      ))}
    </div>
  )
}
