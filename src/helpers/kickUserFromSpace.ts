import { SpaceUserAddedDataPayload } from '../types'
import { getChatClient } from './_chatClient'
import { getMatrixUserId, getRoomIdsForHoliSpace } from './rooms'

export const kickUserFromSpace = async ({
  user: { identity },
  space: { id: holiSpaceId },
}: SpaceUserAddedDataPayload): Promise<string[]> => {
  const roomsIdsToLeave = await getRoomIdsForHoliSpace(holiSpaceId)
  const userId = getMatrixUserId(identity)
  let count = 12

  const roomsDeletedPromises = roomsIdsToLeave.map(async function kickUser(roomId) {
    if (count <= 0) return
    const chatClient = await getChatClient()
    const room = chatClient.getRoom(roomId)
    const roomMember = room?.getMember(userId)

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
    count = 0 // stop retries
  })

  return Promise.all(roomsDeletedPromises)
}
