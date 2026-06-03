import { hasDOM } from '../utils/dom'

export interface ConfettiOptions {
  count?: number
  duration?: number
  colors?: string[]
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** A tiny dependency-free canvas confetti burst. No-ops without a 2D canvas (e.g. SSR/tests). */
export function confetti(options: ConfettiOptions = {}): void {
  if (!hasDOM() || prefersReducedMotion()) return
  const colors = options.colors ?? ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
  const count = options.count ?? 120
  const duration = options.duration ?? 1500

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483647'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  document.body.appendChild(canvas)

  const parts = Array.from({ length: count }, () => ({
    x: canvas.width / 2,
    y: canvas.height / 3,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -12 - 4,
    size: Math.random() * 6 + 4,
    color: colors[Math.floor(Math.random() * colors.length)] ?? '#3b82f6',
    rot: Math.random() * Math.PI,
  }))

  const start = Date.now()
  const tick = (): void => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of parts) {
      p.vy += 0.3
      p.x += p.vx
      p.y += p.vy
      p.rot += 0.1
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      ctx.restore()
    }
    if (Date.now() - start < duration) requestAnimationFrame(tick)
    else canvas.remove()
  }
  requestAnimationFrame(tick)
}

/** Play a short cue. `true` synthesizes a tone per icon; a string plays that audio URL. */
export function playSound(sound: boolean | string, icon?: string): void {
  if (!hasDOM() || !sound) return
  if (typeof sound === 'string') {
    new Audio(sound).play().catch(() => {})
    return
  }
  const Ctx = typeof window !== 'undefined' ? window.AudioContext : undefined
  if (!Ctx) return
  try {
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = icon === 'error' ? 220 : icon === 'warning' ? 330 : 660
    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    /* audio not available */
  }
}
