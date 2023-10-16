import { logPhase, logger } from '../logger'
import { deleteSpaceById } from '../ocis-api'
import { SpaceDeletedDataPayload } from '../types'
import { findOcisSpace } from './helpers'

//Handles the SpaceDeleted event from Google Cloud Pub/Sub.
export const spaceDeletedHandler = async (messageId: string, payload: SpaceDeletedDataPayload): Promise<void> => {
  try {
    const { space } = payload
    const ocisSpace = await logPhase(messageId, 'spaceDeletedHandler.findOcisSpace')(() => findOcisSpace(space))
    if (!ocisSpace) {
      logger.warn(`Space with ID ${space.id} not found, nothing to delete`, { space })
    } else {
      await logPhase(messageId, 'spaceDeletedHandler.deleteSpaceById')(() => deleteSpaceById(ocisSpace.id))
      logger.debug('Space and all of its content were successfully and permanently deleted', { ocisSpace })
    }
  } catch (error) {
    throw new Error(`Failed to delete space ${error}`)
  }
}
