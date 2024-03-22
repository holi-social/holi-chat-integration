import { deactivateAccount, getMatrixId } from '../helpers/matrixClient'
import { logPhase } from '../logger'
import { UserDeletedDataPayload } from '../types'

export const userDeletedHandler = async (messageId: string, { user }: UserDeletedDataPayload): Promise<void> => {
  try {
    await logPhase(messageId, 'userDeleteHandler.deleteUser: ' + user.identity, async () => {
      if (user.identity) {
        await deactivateAccount(getMatrixId(user.identity))
      }
    })
  } catch (error) {
    throw new Error(`Failed to delete user profile: ${error.message}`, { cause: error })
  }
}
