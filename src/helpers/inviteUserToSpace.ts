import { SpaceUserAddedDataPayload } from '../types'
import { getMatrixUserId, joinRoom } from './matrixClient'
import { getRoomIdsForHoliSpace } from './rooms'

export const inviteUserToSpace = async ({
  user: { identity },
  space: { slug: holiSpaceSlug },
}: SpaceUserAddedDataPayload): Promise<void> => {
  const roomsToInvite = await getRoomIdsForHoliSpace(holiSpaceSlug)

  if (roomsToInvite.length < 2) {
    throw Error("Could not find space and general room. Retrying later.")
  }
  const responses = roomsToInvite.map(async (roomId) => {
    await joinRoom(roomId, getMatrixUserId(identity))
  })

  await Promise.all(responses)
}
