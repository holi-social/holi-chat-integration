import { getMatrixUserId, setAvatar, setUserName } from '../helpers/matrixClient'
import { logPhase } from '../logger'
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
        await setUserName(getMatrixUserId(user.identity), user.name)
        await setAvatar(getMatrixUserId(user.identity), user.avatar)
      }
    })
  } catch (error) {
    throw new Error(`Failed to update user profile: ${JSON.stringify(error)}`)
  }
}
