import { logInfo, logPhase } from '../logger'
import { SpaceCreatedDataPayload } from '../types'
import { addGeneralRoomToSpaceContainer, createSpaceContainer, createSpaceGeneralRoom } from '../helpers/createSpace'
import { getRoomIdsForHoliSpace } from '../helpers/rooms'
import { getMatrixUserId } from '../helpers/matrixClient'
import { ChainedError } from '../helpers/chainedError'

// Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceCreatedHandler = async (messageId: string, payload: SpaceCreatedDataPayload): Promise<void> => {
  const { space: spacePayload, creator } = payload
  const creatorId = getMatrixUserId(creator.identity)

  try {
    // check if Space already has rooms
    const rooms = await getRoomIdsForHoliSpace(payload.space.slug)
    if (rooms.length > 0) {
      logInfo(messageId, 'Room for Space already exists: ' + payload.space.slug)
      return
    }
    const parentSpaceRoomId = await logPhase(
      messageId,
      'spaceCreatedHandler.createSpaceContainer: ' + payload.space.slug
    )(() => createSpaceContainer(spacePayload, [creatorId]))

    const generalSpaceRoomId = await logPhase(
      messageId,
      'spaceCreatedHandler.createSpaceGeneralRoom: ' + payload.space.slug
    )(() => createSpaceGeneralRoom([creatorId]))

    await logPhase(
      messageId,
      'spaceCreatedHandler.addGeneralRoomToSpaceContainer: ' + payload.space.slug
    )(() => addGeneralRoomToSpaceContainer(parentSpaceRoomId, generalSpaceRoomId, spacePayload))
  } catch (error) {
    throw new ChainedError(`Failed to create space: ${error.message}`, { cause: error })
  }
}
