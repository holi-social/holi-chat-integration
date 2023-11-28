import { createLogger, transports } from 'winston'

export const logger = createLogger({
  transports: [new transports.Console()],
  level: 'debug',
})

export const logPhase = (messageId: string, phaseName: string) => (fn: () => Promise<any>) => {
  const before = Date.now()
  logger.debug('[' + messageId + '] Starting ' + phaseName)
  return fn()
    .then((result) => {
      const duration = Date.now() - before
      logger.debug('[' + messageId + '] Completed ' + phaseName + ' after ' + duration + ' ms successfully')
      return result
    })
    .catch((error) => {
      const duration = Date.now() - before
      logger.error(
        '[' + messageId + '] Completed ' + phaseName + ' after ' + duration + ' ms with ERROR: ' + JSON.stringify(error)
      )
      throw error
    })
}
