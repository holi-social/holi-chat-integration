import { CHAT_ADMIN_ACCESS_TOKEN, CHAT_SERVER_URL } from '../constants'
import { SpaceUserAddedDataPayload } from '../types'
import { getMatrixUserId, getRoomIdsForHoliSpace } from './rooms'

export const inviteUserToSpace = async ({
  user: { identity },
  space: { id: holiSpaceId },
}: SpaceUserAddedDataPayload) => {
  const roomsToInvite = await getRoomIdsForHoliSpace(holiSpaceId, 'general')

  return roomsToInvite.map(async (roomId) => {
    await fetch(`${CHAT_SERVER_URL}/_synapse/admin/v1/join/${roomId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CHAT_ADMIN_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        user_id: getMatrixUserId(identity),
      }),
    })
  })
}
