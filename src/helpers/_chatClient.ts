import { CHAT_ADMIN_ACCESS_TOKEN, CHAT_ADMIN_USERNAME, CHAT_SERVER_URL } from '../constants'
import { ClientEvent, MatrixClient, MatrixScheduler, SyncState, createClient } from 'matrix-js-sdk'
import { logger } from '../logger'

export const getChatClient = async () => {
  return await chatClientPromise
}

const startChatClient = async () => {
  logger.debug(
    'Starting Matrix Chat Client ' + CHAT_SERVER_URL + ', ' + CHAT_ADMIN_USERNAME + ', ' + CHAT_ADMIN_ACCESS_TOKEN
  )
  const chatClient = createClient({
    baseUrl: CHAT_SERVER_URL,
    userId: CHAT_ADMIN_USERNAME,
    accessToken: CHAT_ADMIN_ACCESS_TOKEN,
    timelineSupport: true,
    scheduler: new MatrixScheduler(),
  })

  logger.debug('Start Client')
  await chatClient.startClient()

  return await new Promise<MatrixClient>((resolve) => {
    chatClient.on(ClientEvent.Sync, (state) => {
      console.debug('~~'.repeat(10) + ' CHAT CLIENT STATE', state)
      if (state === SyncState.Prepared) {
        logger.debug('Matrix Chat Client PREPARED')
        resolve(chatClient)
      }
    })
  })
}

const chatClientPromise: Promise<MatrixClient> = startChatClient()
