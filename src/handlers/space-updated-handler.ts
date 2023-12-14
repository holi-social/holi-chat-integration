import { logPhase } from '../logger'
import { SpaceUpdatedDataPayload } from '../types'
import { handleRoomSharedData, handleRoomStateEvents } from '../helpers/rooms'
import { getSpaceRoomId } from '../helpers/matrixClient'

export const spaceUpdatedHandler = async (messageId: string, payload: SpaceUpdatedDataPayload): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'spaceUpdatedHandler: ' + payload.space.slug
    )(async () => {
      const { space: spacePayload } = payload
      const spaceRoomId = await getSpaceRoomId(spacePayload.slug)

      await handleRoomStateEvents(spaceRoomId, spacePayload)
      await handleRoomSharedData(spaceRoomId, messageId, spacePayload)
    })
  } catch (error) {
    throw new Error(`Failed to update space with ID '${payload.space.id}': ${error.message}`)
  }
}
