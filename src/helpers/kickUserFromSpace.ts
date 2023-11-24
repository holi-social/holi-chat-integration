import { logger } from '../logger'
import { SpaceUserAddedDataPayload } from '../types'
import { getChatClient } from './_chatClient'
import { getMatrixUserId, getRoomIdsForHoliSpace } from './rooms'

const NUMBER_OF_RETRIES = 12
const RETRY_DELAY = 5000

export const kickUserFromSpace = async (
  messageId,
  { user: { identity }, space: { id: holiSpaceId } }: SpaceUserAddedDataPayload
): Promise<string[]> => {
  const roomsIdsToLeave = await getRoomIdsForHoliSpace(holiSpaceId)
  const userId = getMatrixUserId(identity)

  const roomsDeletedPromises = roomsIdsToLeave.map((roomId) => {
    async function kickUser(roomId, count) {
      logger.debug('[' + messageId + '] kickUserFromSpace: ' + holiSpaceId + ' - ' + roomId + ' - ' + identity)
      const chatClient = await getChatClient()
      const room = chatClient.getRoom(roomId)
      const roomMember = room?.getMember(userId)
      if (!roomMember) {
        count++
        if (count > NUMBER_OF_RETRIES) {
          logger.debug('[' + messageId + '] kickUserFromSpace: User ' + identity + ' not found. Giving up.')
          return
        }
        // try 12 times every 5000 if user not found
        logger.debug(
          '[' +
            messageId +
            '] kickUserFromSpace: User ' +
            identity +
            ' not found. Retry ' +
            count +
            ' in ' +
            RETRY_DELAY +
            'ms'
        )
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
        return await kickUser(roomId, count)
      }

      await chatClient.kick(roomId, userId)
    }
    return kickUser(roomId, 0)
  })

  return Promise.all(roomsDeletedPromises)
}
