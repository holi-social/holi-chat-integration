import { logPhase, logger } from '../logger'
import { shareSpaceWithUser } from '../ocis-api'
import { OcisRole, SpaceUserAddedDataPayload } from '../types'
import { findOrCreateOcisUser, findOrCreateOcisSpace } from './helpers'

//Handles the SpaceUserAdded event from Google Cloud Pub/Sub.
export const spaceUserAddedHandler = async (messageId: string, payload: SpaceUserAddedDataPayload): Promise<void> => {
  try {
    const { user, space } = payload

    const ocisUser = await logPhase(
      messageId,
      'spaceUserAddedHandler.findOrCreateOcisUser'
    )(() => findOrCreateOcisUser(user))

    const ocisSpace = await logPhase(
      messageId,
      'spaceUserAddedHandler.findOrCreateOcisSpace'
    )(() => findOrCreateOcisSpace(space))

    //Shares the space with the user with the "editor" role
    await logPhase(
      messageId,
      'spaceUserAddedHandler.shareSpaceWithUser'
    )(() => shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.EDITOR))
    logger.debug('User added to space successfully', { ocisUser, ocisSpace })
  } catch (error) {
    throw new Error(`Failed to add user to space ${error}`)
  }
}
