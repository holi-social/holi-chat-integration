import { kickUserFromSpace } from '../helpers/kickUserFromSpace'
import { logPhase, logger } from '../logger'
import { SpaceUserRemovedDataPayload } from '../types'

//Handles the spaceUserRemoved event from Google Cloud Pub/Sub.
export const spaceUserRemovedHandler = async (
  messageId: string,
  payload: SpaceUserRemovedDataPayload
): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'spaceUserRemovedHandler.kickUserFromSpace: ' + payload.space.slug + ' - ' + payload.user.id
    )(() => kickUserFromSpace(messageId, payload))
    logger.debug('[' + messageId + '] User kicked from space successfully: ' + payload.space.slug + ' - ' + payload.user.id)
  } catch (error) {
    throw new Error(`Failed to kick user "${payload.user.id}" from the space "${payload.space.id}": ${error}`)
  }
}
