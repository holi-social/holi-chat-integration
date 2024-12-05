import { getMatrixId, isUsernameAvailable, setAvatarUrl, setDisplayName } from '../helpers/matrixClient'
import { logPhase, logWarn } from '../logger'
import { UserNameUpdatedDataPayload } from '../types'

export const userNameUpdatedHandler = async (
  messageId: string,
  { user }: UserNameUpdatedDataPayload
): Promise<void> => {
  try {
    await logPhase(messageId, 'userNameUpdateHandler.updateName for identity ' + user.identity + ' to ' + user.name + 'and avatar to ' + user.avatar, async () => {
      if (user.identity) {
        if (!isUsernameAvailable(user.identity)) {
          logWarn(messageId, `Could not update user profile for ${user.identity}, because the user was not found.`)
          return
        }
        await setDisplayName(user.name, getMatrixId(user.identity))
        await setAvatarUrl(user.avatar, getMatrixId(user.identity))
      }
    })
  } catch (error) {
    throw new Error(`Failed to update user profile: ${error.message}`, { cause: error })
  }
}
