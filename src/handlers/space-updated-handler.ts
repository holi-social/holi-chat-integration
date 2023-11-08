import { logPhase } from '../logger'
import { SpaceUpdatedDataPayload } from '../types'
import { startChatClient, stopChatClient } from '../helpers/_chatClient'
import {
  getHoliSpaceRoomsSharedData,
  hasRoomUpdatedValues,
  isSpaceGeneralRoomSharedData,
  setRoomSharedData,
} from '../helpers/rooms'

// Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceUpdatedHandler = async (messageId: string, payload: SpaceUpdatedDataPayload): Promise<void> => {
  await startChatClient()

  try {
    await logPhase(
      messageId,
      'spaceUpdatedHandler'
    )(async () => {
      const { space: spacePayload } = payload
      const [roomId, sharedData] = Object.entries(await getHoliSpaceRoomsSharedData(spacePayload.id, 'general')).find(
        ([_, data]) => isSpaceGeneralRoomSharedData(data)
      )

      if (!isSpaceGeneralRoomSharedData(sharedData)) return
      if (!hasRoomUpdatedValues(sharedData, spacePayload)) return

      await setRoomSharedData(roomId, sharedData.parentSpaceRoomId, spacePayload)
    })
  } catch (error) {
    throw new Error(`Failed to create space ${error}`)
  } finally {
    await stopChatClient()
  }
}
