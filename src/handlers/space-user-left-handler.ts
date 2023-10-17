import { logPhase, logger } from '../logger'
import { removeSpaceUser } from '../chat-api'
import { SpaceUserLeftDataPayload } from '../types'

//Handles the SpaceUserLeft event from Google Cloud Pub/Sub.
export const spaceUserLeftHandler = async (messageId: string, payload: SpaceUserLeftDataPayload): Promise<void> => {
  console.log('++++++++= space_user_left_handler: SPACE USER LEFT', messageId, payload)

  // try {
  //   const { user, space } = payload

  //   const ocisUser = await logPhase(
  //     messageId,
  //     'spaceUserLeftHandler.findOrCreateOcisUser'
  //   )(() => findOrCreateOcisUser(user))

  //   const ocisSpace = await logPhase(
  //     messageId,
  //     'spaceUserLeftHandler.findOrCreateOcisSpace'
  //   )(() => findOrCreateOcisSpace(space))

  //   await logPhase(
  //     messageId,
  //     'spaceUserLeftHandler.removeSpaceUser'
  //   )(() => removeSpaceUser(ocisSpace.id, ocisUser.onPremisesSamAccountName))
  //   logger.debug('User removed from space successfully', { ocisUser, ocisSpace })
  // } catch (error) {
  //   throw new Error(`Failed to remove user from space ${error}`)
  // }
}
