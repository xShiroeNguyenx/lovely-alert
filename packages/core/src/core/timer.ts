/** A pausable countdown used for auto-dismiss (and the timer progress bar). */
export class Timer {
  private id?: ReturnType<typeof setTimeout>
  private startedAt = 0
  private remaining: number
  private running = false

  constructor(
    private readonly total: number,
    private readonly onDone: () => void,
  ) {
    this.remaining = total
  }

  get totalMs(): number {
    return this.total
  }

  start(): void {
    this.running = true
    this.startedAt = Date.now()
    this.id = setTimeout(this.onDone, this.remaining)
  }

  /** Pause and return the remaining time in ms. */
  stop(): number {
    if (!this.running) return this.remaining
    if (this.id !== undefined) clearTimeout(this.id)
    this.remaining -= Date.now() - this.startedAt
    this.running = false
    return this.remaining
  }

  resume(): void {
    if (this.running) return
    this.start()
  }

  toggle(): boolean {
    if (this.running) this.stop()
    else this.resume()
    return this.running
  }

  /** Add (or, with a negative value, subtract) time and keep running. */
  increase(ms: number): number {
    const wasRunning = this.running
    const left = this.stop()
    this.remaining = Math.max(0, left + ms)
    if (wasRunning) this.resume()
    return this.remaining
  }

  getLeft(): number {
    return this.running ? this.remaining - (Date.now() - this.startedAt) : this.remaining
  }

  isRunning(): boolean {
    return this.running
  }

  clear(): void {
    if (this.id !== undefined) clearTimeout(this.id)
    this.running = false
  }
}
