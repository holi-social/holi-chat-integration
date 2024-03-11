import { logPhase } from '../logger'
import { SpaceUpdatedDataPayload } from '../types'
import { updateSpaceRoomSharedData, updateSpaceRoomNameAndAvatar } from '../helpers/rooms'
import { getSpaceRoomId } from '../helpers/matrixClient'
import { ChainedError } from '../helpers/chainedError'

export const spaceUpdatedHandler = async (messageId: string, payload: SpaceUpdatedDataPayload): Promise<void> => {
  try {
    await logPhase(
      messageId,
      'spaceUpdatedHandler: ' + payload.space.slug
    )(async () => {
      const { space: spacePayload } = payload
      const spaceRoomId = await getSpaceRoomId(spacePayload.slug)

      await updateSpaceRoomNameAndAvatar(spaceRoomId, spacePayload)
      await updateSpaceRoomSharedData(spaceRoomId, messageId, spacePayload)
    })
  } catch (error) {
    throw new ChainedError(`Failed to update space with ID '${payload.space.id}': ${error.message}`, { cause: error })
  }
}
