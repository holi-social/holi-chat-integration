import { logError, logInfo, logPhase } from '../logger'
import { SpaceUpdatedDataPayload } from '../types'
import {
  getGeneralRoomSharedDataForSpace,
  hasRoomUpdatedValues,
  setRoomAvatar,
  setRoomSharedData,
} from '../helpers/rooms'
import { isSpaceGeneralRoomSharedData } from '../helpers/matrixClient'

export const spaceUpdatedHandler = async (messageId: string, payload: SpaceUpdatedDataPayload): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'spaceUpdatedHandler: ' + payload.space.slug
    )(async () => {
      const { space: spacePayload } = payload
      const sharedDataResult = await getGeneralRoomSharedDataForSpace(spacePayload.slug)
      if (!sharedDataResult) {
        logInfo(
          messageId,
          'spaceUpdatedHandler - getHoliSpaceRoomsSharedData did not find a room for space ' + spacePayload.slug
        )
        return
      }
      const [roomId, sharedData] = sharedDataResult

      if (!roomId || !sharedData) {
        logError(
          messageId,
          'spaceUpdatedHandler - getHoliSpaceRoomsSharedData roomId or sharedData is undefined processing event:' +
            JSON.stringify(payload, null, 4)
        )
        return
      }
      if (!isSpaceGeneralRoomSharedData(sharedData)) return
      if (!hasRoomUpdatedValues(sharedData, spacePayload)) return

      await setRoomSharedData(roomId, sharedData.parentSpaceRoomId, spacePayload)
      await setRoomAvatar(roomId, spacePayload.avatar)
    })
  } catch (error) {
    throw new Error(`Failed to update space with ID '${payload.space.id}': ${error.message}`)
  }
}
