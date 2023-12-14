import { logError, logInfo, logPhase } from '../logger'
import { SpaceUpdatedDataPayload } from '../types'
import {
  findStateEventByType,
  getGeneralRoomSharedDataForSpace,
  getRoomChildren,
  handleRoomStateEvent,
  handleRoomStateEvents,
  hasRoomUpdatedValues,
  hasSameEventContent,
  setRoomAvatar,
  setRoomName,
  setRoomSharedData,
} from '../helpers/rooms'
import {
  getRoomStateEvents,
  getSpaceRoomId,
  isSpaceGeneralRoomSharedData,
  EventType as RoomEventType,
} from '../helpers/matrixClient'

export const spaceUpdatedHandler = async (messageId: string, payload: SpaceUpdatedDataPayload): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'spaceUpdatedHandler: ' + payload.space.slug
    )(async () => {
      const { space: spacePayload } = payload
      const spaceRoomId = await getSpaceRoomId(spacePayload.slug)
      const sharedDataResult = await getGeneralRoomSharedDataForSpace(spaceRoomId)

      await handleRoomStateEvents(spaceRoomId, spacePayload)

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
    })
  } catch (error) {
    throw new Error(`Failed to update space with ID '${payload.space.id}': ${error.message}`)
  }
}
