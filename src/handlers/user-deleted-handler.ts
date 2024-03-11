import { deactivateAccount, getMatrixUserId } from '../helpers/matrixClient'
import { logPhase } from '../logger'
import { UserDeletedDataPayload } from '../types'
import { ChainedError } from '../helpers/chainedError'

export const userDeletedHandler = async (messageId: string, { user }: UserDeletedDataPayload): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'userDeleteHandler.deleteUser: ' + user.identity
    )(async () => {
      if (user.identity) {
        await deactivateAccount(getMatrixUserId(user.identity))
      }
    })
  } catch (error) {
    throw new ChainedError(`Failed to delete user profile: ${error.message}`, { cause: error })
  }
}
