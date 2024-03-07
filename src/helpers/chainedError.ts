export class ChainedError extends Error {
  cause: Error | undefined

  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'ChainedError'
    this.cause = cause
    // Set the prototype explicitly to avoid issues with instanceof checks
    Object.setPrototypeOf(this, ChainedError.prototype)
  }
}
