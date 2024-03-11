import { createLogger, transports } from 'winston'

export const logger = createLogger({
  transports: [new transports.Console()],
  level: 'debug',
})

export const logDebug = (messageId: string, message: string) => {
  logger.debug('[' + messageId + '] ' + message)
}

export const logInfo = (messageId: string, message: string) => {
  logger.info('[' + messageId + '] ' + message)
}

export const logWarn = (messageId: string, message: string) => {
  logger.warn('[' + messageId + '] ' + message)
}

export const logError = (messageId: string, message: string) => {
  logger.error('[' + messageId + '] ' + message)
}

export const logPhase = async (messageId: string, phaseName: string, fn: () => Promise<any>) => {
  const before = Date.now()
  logDebug(messageId, 'Starting ' + phaseName)
  return fn()
    .then((result) => {
      const duration = Date.now() - before
      logDebug(messageId, 'Completed ' + phaseName + ' after ' + duration + ' ms successfully')
      return result
    })
    .catch((error) => {
      const duration = Date.now() - before
      logError(messageId, `Completed ${phaseName} after ${duration} ms with ERROR: ${error.name} - ${error.message}`)
      throw error
    })
}
