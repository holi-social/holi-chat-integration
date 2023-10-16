import { logPhase, logger } from '../logger'
import { deleteUserById } from '../ocis-api'
import { UserDeletedDataPayload } from '../types'
import { findOcisUser } from './helpers'

//Handles the UserDeleted event from Google Cloud Pub/Sub.
export const userDeletedHandler = async (messageId: string, payload: UserDeletedDataPayload): Promise<void> => {
  try {
    const { user } = payload
    const ocisUser = await logPhase(messageId, 'userDeletedHandler.findOcisUser')(() => findOcisUser(user))
    if (!ocisUser) {
      logger.warn(`User with ID ${user.id} not found in oCIS, nothing to delete`, { user })
    } else {
      await logPhase(messageId, 'userDeletedHandler.deleteUser')(() => deleteUserById(ocisUser.id))
      logger.debug('User deleted successfully', { ocisUser })
    }
  } catch (error) {
    throw new Error(`Failed to delete user ${error}`)
  }
}
