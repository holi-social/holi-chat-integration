import { SpaceUserAddedDataPayload } from '../types'
import { joinRoom } from './matrixClient'
import { getRoomIdsForHoliSpace } from './rooms'

export const inviteUserToSpace = async ({
  user: { identity },
  space: { id: holiSpaceId },
}: SpaceUserAddedDataPayload): Promise<Response[]> => {
  const roomsToInvite = await getRoomIdsForHoliSpace(holiSpaceId)

  const responses = roomsToInvite.map(async (roomId) => {
    return await joinRoom(roomId, identity)
  })

  return Promise.all(responses)
}
