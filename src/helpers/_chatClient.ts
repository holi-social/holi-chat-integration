import { HOLI_CHAT_ADMIN_ACCESS_TOKEN, HOLI_CHAT_ADMIN_ID, HOLI_CHAT_SERVER_URL } from '../constants'
import { ClientEvent, MatrixClient, MatrixScheduler, SyncState, createClient } from 'matrix-js-sdk'

export let chatClient: MatrixClient

export const startChatClient = async () => {
  chatClient = createClient({
    baseUrl: HOLI_CHAT_SERVER_URL,
    userId: HOLI_CHAT_ADMIN_ID,
    accessToken: HOLI_CHAT_ADMIN_ACCESS_TOKEN,
    timelineSupport: true,
    scheduler: new MatrixScheduler(),
  })

  await chatClient.startClient()

  return await new Promise<MatrixClient>((resolve) => {
    chatClient.on(ClientEvent.Sync, (state) => {
      console.debug('~~'.repeat(10) + ' CHAT CLIENT STATE', state)
      if (state === SyncState.Prepared) {
        resolve(chatClient)
      }
    })
  })
}

export const stopChatClient = async () => {
  // TODO: check if we need this code except chatClient.stopClient()
  await chatClient.store.deleteAllData()
  await chatClient.store.destroy()
  chatClient.stopClient()
  await chatClient.clearStores()
}
