export class ChainedError extends Error {
  cause: Error | undefined

  constructor(message: string, options?: { cause: Error }) {
    super(message)
    this.name = 'ChainedError'
    this.cause = options?.cause
    // Set the prototype explicitly to avoid issues with instanceof checks
    Object.setPrototypeOf(this, ChainedError.prototype)
  }
}

export const getFullStackTrace = (error: Error) => {
  let fullStackTrace = error.stack || error.message
  if (error instanceof Error) {
    let cause = error?.cause

    while (cause && cause instanceof Error) {
      fullStackTrace += '\nCaused by: ' + (cause.stack || cause.message)
      cause = cause.cause
    }
  }
  return fullStackTrace
}
