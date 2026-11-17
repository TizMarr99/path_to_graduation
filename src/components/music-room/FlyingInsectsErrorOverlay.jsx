import { useEffect, useRef } from 'react'

// Seven wasps (first source), eight bugs (second source).
const INSECT_SOURCE_INDICES = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1]
const randomBetween = (min, max) => min + Math.random() * (max - min)
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function createFlight(start, end, width, height) {
  const bend = randomBetween(-0.3, 0.3)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const controlA = {
    x: clamp(start.x + dx / 3 - dy * bend, 0, width),
    y: clamp(start.y + dy / 3 + dx * bend, 0, height),
  }
  const controlB = {
    x: clamp(start.x + dx * 2 / 3 - dy * bend, 0, width),
    y: clamp(start.y + dy * 2 / 3 + dx * bend, 0, height),
  }
  let distance = 0
  let previous = start
  const frames = Array.from({ length: 25 }, (_, index) => {
    const t = index / 24
    const u = 1 - t
    const x = u ** 3 * start.x + 3 * u ** 2 * t * controlA.x + 3 * u * t ** 2 * controlB.x + t ** 3 * end.x
    const y = u ** 3 * start.y + 3 * u ** 2 * t * controlA.y + 3 * u * t ** 2 * controlB.y + t ** 3 * end.y
    distance += Math.hypot(x - previous.x, y - previous.y)
    previous = { x, y }
    return { transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`, distance }
  })
  return {
    distance,
    // Space the samples by distance so the insect keeps a steady flight speed.
    keyframes: frames.map(({ transform, distance: travelled }) => ({ transform, offset: travelled / distance })),
  }
}

export default function FlyingInsectsErrorOverlay({ sources }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let stopFlights = () => {}

    function restartFlights() {
      stopFlights()
      if (motionPreference.matches) return
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      let cancelled = false
      const animations = new Set()
      const insects = container.querySelectorAll('[data-flying-insect]')

      async function fly(insect, index) {
        const column = index % 5
        // Keep three insects patrolling each side while the others cross the screen.
        const horizontalRange = column === 0 ? [0.02, 0.22] : column === 4 ? [0.78, 0.98] : [0.02, 0.98]
        const speedMultiplier = insect.dataset.insectKind === 'wasp' ? 1.25 : 1
        // Start throughout the viewport, rather than waiting for all copies to enter.
        let position = {
          x: width * ((column + randomBetween(0.15, 0.85)) / 5),
          y: height * ((Math.floor(index / 5) + randomBetween(0.15, 0.85)) / 3),
        }
        let previousFacing = 1
        let previousTilt = 0
        while (!cancelled) {
          let destination
          // Pick a fresh, distant destination on every leg, including reverse flight.
          for (let attempt = 0; attempt < 12; attempt += 1) {
            destination = { x: randomBetween(...horizontalRange) * width, y: randomBetween(0.02, 0.98) * height }
            if (Math.hypot(destination.x - position.x, destination.y - position.y) > Math.hypot(width, height) * 0.3) break
          }
          const dx = destination.x - position.x
          const dy = destination.y - position.y
          const facing = dx >= 0 ? 1 : -1
          const tilt = clamp(Math.atan2(dy, Math.abs(dx)) * 180 / Math.PI, -30, 30) * facing
          const sprite = insect.firstElementChild
          const turn = sprite.animate([
            { transform: `rotate(${previousTilt}deg) scaleX(${previousFacing})` },
            { transform: `rotate(${tilt}deg) scaleX(${facing})` },
          ], { duration: 240, fill: 'forwards', easing: 'ease-in-out' })
          animations.add(turn)
          void turn.finished.then(() => {
            if (!cancelled) sprite.style.transform = `rotate(${tilt}deg) scaleX(${facing})`
            turn.cancel()
            animations.delete(turn)
          }).catch(() => {})
          const { keyframes, distance } = createFlight(position, destination, width, height)
          const speed = randomBetween(100, 180) * clamp(width / 1100, 0.6, 1.4)
          const flight = insect.animate(keyframes, { duration: Math.max(1600, distance / speed * 1000) / speedMultiplier, fill: 'forwards' })
          animations.add(flight)
          try {
            await flight.finished
          } catch {
            return // Unmount, resize or reduced motion cancels the current leg.
          }
          if (cancelled) return
          insect.style.transform = keyframes.at(-1).transform
          flight.cancel()
          animations.delete(flight)
          position = destination
          previousFacing = facing
          previousTilt = tilt
        }
      }

      stopFlights = () => {
        cancelled = true
        animations.forEach((animation) => animation.cancel())
        animations.clear()
      }
      insects.forEach((insect, index) => { void fly(insect, index) })
    }

    const observer = new ResizeObserver(restartFlights)
    observer.observe(container)
    motionPreference.addEventListener('change', restartFlights)
    return () => {
      stopFlights()
      observer.disconnect()
      motionPreference.removeEventListener('change', restartFlights)
    }
  }, [sources])

  return (
    <div ref={containerRef} aria-hidden="true" className="flying-insects-error-overlay pointer-events-none absolute inset-0 z-20 overflow-hidden select-none">
      <div className="spider-error-flash absolute inset-0 z-0 bg-red-700/40" />
      {INSECT_SOURCE_INDICES.map((sourceIndex, index) => (
        <div key={index} data-flying-insect data-insect-kind={sourceIndex === 0 ? 'wasp' : 'bug'} className="absolute left-0 top-0 z-10 will-change-transform"
          style={{ width: `clamp(76px, ${10 + index % 4 * 2}vw, ${140 + index % 4 * 22}px)` }}>
          <img alt="" draggable={false} src={sources[sourceIndex % sources.length]}
            className={`block h-auto w-full object-contain${sourceIndex === 1 ? ' flying-insect-bug' : ''}`} />
        </div>
      ))}
    </div>
  )
}
