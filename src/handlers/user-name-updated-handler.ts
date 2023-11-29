import { getMatrixUserId, isUsernameAvailable, setAvatarUrl, setDisplayName } from '../helpers/matrixClient'
import { logPhase, logger } from '../logger'
import { UserNameUpdatedDataPayload } from '../types'

export const userNameUpdatedHandler = async (
  messageId: string,
  { user }: UserNameUpdatedDataPayload
): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'userNameUpdateHandler.updateName: ' + user.identity + ' to ' + user.name
    )(async () => {
      if (user.identity) {
        if (!isUsernameAvailable(user.identity)) {
          logger.warn(`Could not update user profile for ${user.identity}, because the user was not found.`)
          return
        }
        await setDisplayName(user.name, getMatrixUserId(user.identity))
        await setAvatarUrl(user.avatar, getMatrixUserId(user.identity))
      }
    })
  } catch (error) {
    throw new Error(`Failed to update user profile: ${error.message}`)
  }
}
