import { logPhase, logger } from '../logger'
import { removeSpaceUser } from '../chat-api'
import { SpaceUserRemovedDataPayload } from '../types'

//Handles the spaceUserRemoved event from Google Cloud Pub/Sub.
export const spaceUserRemovedHandler = async (
  messageId: string,
  payload: SpaceUserRemovedDataPayload
): Promise<void> => {
  console.log('++++++++= space_user_removed_handler: SPACE USER REMOVED', messageId, payload)

  // try {
  //   const { user, space } = payload

  //   const ocisUser = await logPhase(
  //     messageId,
  //     'spaceUserRemovedHandler.findOrCreateOcisUser'
  //   )(() => findOrCreateOcisUser(user))

  //   const ocisSpace = await logPhase(
  //     messageId,
  //     'spaceUserRemovedHandler.findOrCreateOcisSpace'
  //   )(() => findOrCreateOcisSpace(space))

  //   await logPhase(
  //     messageId,
  //     'spaceUserRemovedHandler.removeSpaceUser'
  //   )(() => removeSpaceUser(ocisSpace.id, ocisUser.onPremisesSamAccountName))
  //   logger.debug('User removed from space successfully', { ocisUser, ocisSpace })
  // } catch (error) {
  //   throw new Error(`Failed to remove user from space ${error}`)
  // }
}
