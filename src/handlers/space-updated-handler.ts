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
  console.log('spaceUpdatedHandler Event', messageId, payload)
  await startChatClient()
  console.log('spaceUpdatedHandler client initialized')

  try {
    await logPhase(
      messageId,
      'spaceUpdatedHandler: ' + payload.space.slug
    )(async () => {
      const { space: spacePayload } = payload
      const [roomId, sharedData] = Object.entries(await getHoliSpaceRoomsSharedData(spacePayload.id, 'general')).find(
        ([_, data]) => isSpaceGeneralRoomSharedData(data)
      )

      if (!isSpaceGeneralRoomSharedData(sharedData)) return
      if (!hasRoomUpdatedValues(sharedData, spacePayload)) return

      await setRoomSharedData(roomId, sharedData.parentSpaceRoomId, spacePayload)
      await setRoomAvatar(roomId, spacePayload.avatar)
    })
  } catch (error) {
    throw new Error(`Failed to create space ${error}`)
  } finally {
    await stopChatClient()
  }
}
