import { logDebug } from '../logger'
import { SpaceUserAddedDataPayload } from '../types'
import { getMatrixUserId, joinRoom } from './matrixClient'
import { retryExceeded } from './retryCounter'
import { getRoomIdsForHoliSpace } from './rooms'

export const inviteUserToSpace = async (
  messageId: string,
  { user: { identity }, space: { slug: holiSpaceSlug } }: SpaceUserAddedDataPayload
): Promise<void> => {
  const roomsToInvite = await getRoomIdsForHoliSpace(holiSpaceSlug)

  if (roomsToInvite.length < 2) {
    if (retryExceeded(messageId)) {
      logDebug(messageId, 'inviteUserToSpace: No rooms found for space: "' + holiSpaceSlug + '". Giving up.')
      return
    }
    throw Error(
      'inviteUserToSpace: Could not find space and general room for space: "' + holiSpaceSlug + '". Retrying later.'
    )
  }
  const responses = roomsToInvite.map(async (roomId) => {
    await joinRoom(roomId, getMatrixUserId(identity))
  })

  await Promise.all(responses)
}
