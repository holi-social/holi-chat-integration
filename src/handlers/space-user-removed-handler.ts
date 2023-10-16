import { logPhase, logger } from '../logger'
import { removeSpaceUser } from '../ocis-api'
import { SpaceUserRemovedDataPayload } from '../types'
import { findOrCreateOcisUser, findOrCreateOcisSpace } from './helpers'

//Handles the spaceUserRemoved event from Google Cloud Pub/Sub.
export const spaceUserRemovedHandler = async (
  messageId: string,
  payload: SpaceUserRemovedDataPayload
): Promise<void> => {
  try {
    const { user, space } = payload

    const ocisUser = await logPhase(
      messageId,
      'spaceUserRemovedHandler.findOrCreateOcisUser'
    )(() => findOrCreateOcisUser(user))

    const ocisSpace = await logPhase(
      messageId,
      'spaceUserRemovedHandler.findOrCreateOcisSpace'
    )(() => findOrCreateOcisSpace(space))

    await logPhase(
      messageId,
      'spaceUserRemovedHandler.removeSpaceUser'
    )(() => removeSpaceUser(ocisSpace.id, ocisUser.onPremisesSamAccountName))
    logger.debug('User removed from space successfully', { ocisUser, ocisSpace })
  } catch (error) {
    throw new Error(`Failed to remove user from space ${error}`)
  }
}
