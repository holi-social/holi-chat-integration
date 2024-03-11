import { kickUserFromSpace } from '../helpers/kickUserFromSpace'
import { logPhase } from '../logger'
import { SpaceUserRemovedDataPayload } from '../types'
import { ChainedError } from '../helpers/chainedError'

//Handles the spaceUserRemoved event from Google Cloud Pub/Sub.
export const spaceUserRemovedHandler = async (
  messageId: string,
  payload: SpaceUserRemovedDataPayload
): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'spaceUserRemovedHandler.kickUserFromSpace: ' + payload.space.slug + ' - ' + payload.user.id,
      () => kickUserFromSpace(messageId, payload)
    )
  } catch (error) {
    throw new ChainedError(
      `Failed to kick user "${payload.user.id}" from the space "${payload.space.id}": ${error.message}`,
      {
        cause: error,
      }
    )
  }
}
