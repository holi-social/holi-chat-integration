import { logPhase } from '../logger'
import { SpaceDeletedDataPayload } from '../types'
import { deleteSpaceRoom } from '../helpers/deleteSpace'

// Handles the SpaceDeleted event from Google Cloud Pub/Sub.
export const spaceDeletedHandler = async (messageId: string, { space }: SpaceDeletedDataPayload): Promise<void> => {
  try {
    await logPhase(messageId, 'spaceDeletedHandler.deleteSpaceRoom: ' + space.slug)(() => deleteSpaceRoom(space))
  } catch (error) {
    throw new Error(`Failed to delete space room: ${error.message}`)
  }
}
