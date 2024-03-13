import { inviteUserToSpace } from '../helpers/inviteUserToSpace'
import { logPhase } from '../logger'
import { SpaceUserAddedDataPayload } from '../types'

// Handles the SpaceUserAdded event from Google Cloud Pub/Sub.
export const spaceUserAddedHandler = async (messageId: string, payload: SpaceUserAddedDataPayload): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'spaceUserAddedHandler.inviteUserToSpace: ' + payload.space.slug + ' - ' + payload.user.id,
      () => inviteUserToSpace(messageId, payload)
    )
  } catch (error) {
    throw new Error(`Failed to add user "${payload.user.id}" to space "${payload.space.id}": ${error.message}`, {
      cause: error,
    })
  }
}
