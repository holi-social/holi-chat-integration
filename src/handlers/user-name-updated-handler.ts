import * as matrix from '../helpers/matrixClient'
import { getMatrixId } from '../helpers/matrixClient'
import { logPhase, logWarn } from '../logger'
import { UserNameUpdatedDataPayload } from '../types'

export const userNameUpdatedHandler = async (
  messageId: string,
  { user }: UserNameUpdatedDataPayload
): Promise<void> => {
  try {
    await logPhase(messageId, 'userNameUpdateHandler.updateName for identity ' + user.identity + ' to ' + user.name + ' and avatar to ' + user.avatar, async () => {
      if (user.identity) {
        await matrix.setDisplayName(user.name, getMatrixId(user.identity))
        await matrix.setAvatarUrl(user.avatar, getMatrixId(user.identity))
      } else {
        logWarn(messageId, `Could not update user profile for ${user.identity}, missing matrix identity.`)
      }
    })
  } catch (error) {
    throw new Error(`Failed to update user profile: ${error.message}`, { cause: error })
  }
}
