import { SpaceUserAddedDataPayload } from '../types'
import { fetchWithAuth } from '../utils'
import { getMatrixUserId, getRoomIdsForHoliSpace } from './rooms'

export const inviteUserToSpace = async ({
  user: { identity },
  space: { id: holiSpaceId },
}: SpaceUserAddedDataPayload): Promise<Response[]> => {
  const roomsToInvite = await getRoomIdsForHoliSpace(holiSpaceId)

  const responses = roomsToInvite.map(async (roomId) => {
    return await fetchWithAuth(`/_synapse/admin/v1/join/${roomId}`, 'POST', {
      user_id: getMatrixUserId(identity),
    })
  })

  return Promise.all(responses)
}
