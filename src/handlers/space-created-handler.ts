import { logPhase } from '../logger'
import { SpaceCreatedDataPayload } from '../types'
import { addGeneralRoomToSpaceContainer, createSpaceContainer, createSpaceGeneralRoom } from '../helpers/createSpace'
import { startChatClient, stopChatClient } from '../helpers/_chatClient'
import { getMatrixUserId } from '../helpers/rooms'

// Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceCreatedHandler = async (messageId: string, payload: SpaceCreatedDataPayload): Promise<void> => {
  await startChatClient()

  const { space: spacePayload, creator } = payload
  const creatorId = getMatrixUserId(creator.identity)

  try {
    const parentSpaceRoomId = await logPhase(
      messageId,
      'spaceCreatedHandler.createSpaceContainer'
    )(() => createSpaceContainer(spacePayload, [creatorId]))

    const generalSpaceRoomId = await logPhase(
      messageId,
      'spaceCreatedHandler.createSpaceGeneralRoom'
    )(() => createSpaceGeneralRoom([creatorId]))

    await logPhase(
      messageId,
      'spaceCreatedHandler.addGeneralRoomToSpaceContainer'
    )(() => addGeneralRoomToSpaceContainer(parentSpaceRoomId, generalSpaceRoomId, spacePayload))
  } catch (error) {
    throw new Error(`Failed to create space ${error}`)
  } finally {
    await stopChatClient()
  }
}
