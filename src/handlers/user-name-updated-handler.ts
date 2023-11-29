import { getMatrixUserId, isUsernameAvailable, setAvatarUrl, setDisplayName } from '../helpers/matrixClient'
import { getCount, retryExceeded } from '../helpers/retryCounter'
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
        if (isUsernameAvailable(user.identity)) {
          if (retryExceeded(messageId)) {
            logger.warn(`Could not update user profile for ${user.identity}. Giving up after too many retries`)
            return
          }
          throw new Error('Identity unknown: ' + user.identity + ' - Retry ' + getCount(messageId))
        }
        await setDisplayName(user.name, getMatrixUserId(user.identity))
        await setAvatarUrl(user.avatar, getMatrixUserId(user.identity))
      }
    })
  } catch (error) {
    throw new Error(`Failed to update user profile: ${error.message}`)
  }
}
