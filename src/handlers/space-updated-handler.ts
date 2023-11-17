import { logPhase } from '../logger'
import { SpaceUpdatedDataPayload } from '../types'
import { startChatClient, stopChatClient } from '../helpers/_chatClient'
import {
  getHoliSpaceRoomsSharedData,
  hasRoomUpdatedValues,
  isSpaceGeneralRoomSharedData,
  setRoomAvatar,
  setRoomSharedData,
} from '../helpers/rooms'

// Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceUpdatedHandler = async (messageId: string, payload: SpaceUpdatedDataPayload): Promise<void> => {
  console.log('spaceUpdatedHandler Event', messageId, JSON.stringify(payload, null, 2))
  await startChatClient()
  console.log('spaceUpdatedHandler client initialized')

  console.log('------------- UPDATE - init:', JSON.stringify(payload, null, 4), payload)

  try {
    await logPhase(
      messageId,
      'spaceUpdatedHandler: ' + payload.space.slug
    )(async () => {
      const { space: spacePayload } = payload
      const [roomId, sharedData] =
        Object.entries(await getHoliSpaceRoomsSharedData(spacePayload.id, 'general')).find(([_, data]) =>
          isSpaceGeneralRoomSharedData(data)
        ) ?? []

      console.log('------------- UPDATE - getHoliSpaceRoomsSharedData:', roomId, JSON.stringify(sharedData, null, 4))

      if (!roomId || !sharedData) return
      if (!isSpaceGeneralRoomSharedData(sharedData)) return
      if (!hasRoomUpdatedValues(sharedData, spacePayload)) return

      console.log('------------- UPDATE - before updating')

      await setRoomSharedData(roomId, sharedData.parentSpaceRoomId, spacePayload)
      await setRoomAvatar(roomId, spacePayload.avatar)

      console.log('------------- UPDATE - after updating')
    })
  } catch (error) {
    throw new Error(`Failed to update space with ID '${payload.space.id}': ${error}`)
  } finally {
    await stopChatClient()
  }
}
