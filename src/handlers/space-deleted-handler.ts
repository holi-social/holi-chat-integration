import { logPhase } from '../logger'
import { SpaceDeletedDataPayload } from '../types'
import { deleteSpaceRoom } from '../helpers/deleteSpace'
import { ChainedError } from '../helpers/chainedError'

// Handles the SpaceDeleted event from Google Cloud Pub/Sub.
export const spaceDeletedHandler = async (messageId: string, { space }: SpaceDeletedDataPayload): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'spaceDeletedHandler.deleteSpaceRoom: ' + space.slug
    )(() => deleteSpaceRoom(messageId, space))
  } catch (error) {
    throw new ChainedError(`Failed to delete space room: ${error.message}`, error)
  }
}
