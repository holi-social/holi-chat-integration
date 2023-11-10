import { startChatClient, stopChatClient } from '../helpers/_chatClient'
import { kickUserFromSpace } from '../helpers/kickUserFromSpace'
import { logPhase, logger } from '../logger'
import { SpaceUserLeftDataPayload } from '../types'

//Handles the SpaceUserLeft event from Google Cloud Pub/Sub.
export const spaceUserLeftHandler = async (messageId: string, payload: SpaceUserLeftDataPayload): Promise<void> => {
  await startChatClient()

  try {
    await logPhase(
      messageId,
      'spaceUserLeftHandler.kickUserFromSpace: ' + payload.space.slug + ' - ' + payload.user.id
    )(() => kickUserFromSpace(payload))
    logger.debug('User removed from space successfully', { user: payload.user.id, space: payload.space.id })
  } catch (error) {
    throw new Error(`Failed to remove user "${payload.user.id}" from space "${payload.space.id}": ${error}`)
  } finally {
    await stopChatClient()
  }
}
