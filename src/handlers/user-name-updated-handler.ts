import { logPhase } from '../logger'
import { UserNameUpdatedDataPayload } from '../types'

//Handles UserNameUpdated event from Google Cloud Pub/Sub.
export const userNameUpdatedHandler = async (messageId: string, payload: UserNameUpdatedDataPayload): Promise<void> => {
  console.log('++++++++= user_name_updated_handler: USER NAME UPDATED', messageId, payload)

  // try {
  //   const { user } = payload
  //   await logPhase(messageId, 'userNameUpdatedHandler.updateOrCreateOcisUser')(() => updateOrCreateOcisUser(user))
  // } catch (error) {
  //   throw new Error(`Failed to update user name ${error}`)
  // }
}
