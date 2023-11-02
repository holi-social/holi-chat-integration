import { SpaceUserAddedDataPayload } from '../types'
import { chatClient } from './_chatClient'
import { getMatrixUserId, getRoomIdsForHoliSpace } from './rooms'

export const kickUserFromSpace = async ({
  user: { identity },
  space: { id: holiSpaceId },
}: SpaceUserAddedDataPayload) => {
  const roomsToDelete = await getRoomIdsForHoliSpace(holiSpaceId, 'general')
  const userId = getMatrixUserId(identity)
  let count = 12

  return roomsToDelete.map(async function kickUser(roomId) {
    const room = chatClient.getRoom(roomId)
    const roomMember = room?.getMember(userId)

    if (count <= 0) return
    if (!roomMember) {
      // try 12 times every 5000 if user not found
      await new Promise((resolve) =>
        setTimeout(() => {
          count--
          resolve(true)
        }, 5000)
      )
      return await kickUser(roomId)
    }

    await chatClient.kick(roomId, userId)
  })
}
