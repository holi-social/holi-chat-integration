import { inviteUserToSpace } from '../helpers/inviteUserToSpace'
import { logPhase, logger } from '../logger'
import { SpaceUserAddedDataPayload } from '../types'

// Handles the SpaceUserAdded event from Google Cloud Pub/Sub.
export const spaceUserAddedHandler = async (messageId: string, payload: SpaceUserAddedDataPayload): Promise<void> => {
  try {
    await logPhase(messageId, 'spaceUserAddedHandler.findOrCreateOcisUser')(() => inviteUserToSpace(payload))
    logger.debug('User added to space successfully', { user: payload.user.id, space: payload.space.id })
  } catch (error) {
    throw new Error(`Failed to add user "${payload.user.id}" to space "${payload.space.id}": ${error}`)
  }
}
