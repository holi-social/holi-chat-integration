import { logPhase } from '../logger'
import { UserNameUpdatedDataPayload } from '../types'
import { updateOrCreateOcisUser } from './helpers'

//Handles UserNameUpdated event from Google Cloud Pub/Sub.
export const userNameUpdatedHandler = async (messageId: string, payload: UserNameUpdatedDataPayload): Promise<void> => {
  try {
    const { user } = payload
    await logPhase(messageId, 'userNameUpdatedHandler.updateOrCreateOcisUser')(() => updateOrCreateOcisUser(user))
  } catch (error) {
    throw new Error(`Failed to update user name ${error}`)
  }
}
