import { createLogger, transports } from 'winston'

export const logger = createLogger({
  transports: [new transports.Console()],
  level: 'debug',
})

export const logPhase = (messageId: string, phaseName: string) => (fn: () => Promise<any>) => {
  const before = Date.now()
  logger.debug('[' + messageId + '] Starting ' + phaseName)
  return fn().finally(() => {
    const duration = Date.now() - before
    logger.debug('[' + messageId + '] Completed ' + phaseName + ' after ' + duration + ' ms')
  })
}
