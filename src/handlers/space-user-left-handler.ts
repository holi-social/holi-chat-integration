import { kickUserFromSpace } from '../helpers/kickUserFromSpace'
import { logPhase, logger } from '../logger'
import { SpaceUserLeftDataPayload } from '../types'

//Handles the SpaceUserLeft event from Google Cloud Pub/Sub.
export const spaceUserLeftHandler = async (messageId: string, payload: SpaceUserLeftDataPayload): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'spaceUserLeftHandler.kickUserFromSpace: ' + payload.space.slug + ' - ' + payload.user.id
    )(() => kickUserFromSpace(messageId, payload))
  } catch (error) {
    throw new Error(`Failed user to leave "${payload.user.id}" the space "${payload.space.id}": ${error}`)
  }
}
