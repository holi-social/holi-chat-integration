import { logger } from '../logger'
import { SpaceUserAddedDataPayload } from '../types'
import { getMatrixUserId, kick } from './matrixClient'
import { getRoomIdsForHoliSpace } from './rooms'

const NUMBER_OF_RETRIES = 12
const RETRY_DELAY = 5000

export const kickUserFromSpace = async (
  messageId,
  { user: { identity }, space: { id: holiSpaceId } }: SpaceUserAddedDataPayload
) => {
  const roomsIdsToLeave = await getRoomIdsForHoliSpace(holiSpaceId)
  if (roomsIdsToLeave.length == 0) {
    logger.debug('[' + messageId + '] kickUserFromSpace: No rooms found for space: ' + holiSpaceId)
    return
  }
  const userId = getMatrixUserId(identity)

  const roomsDeletedPromises = roomsIdsToLeave.map((roomId) => {
    async function kickUser(roomId, count) {
      logger.debug('[' + messageId + '] kickUserFromSpace: ' + holiSpaceId + ' - ' + roomId + ' - ' + identity)
      const resp = await kick(roomId, userId)
      if (resp.status == 403 && resp.json.errcode == 'M_FORBIDDEN') {
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
    }
    return kickUser(roomId, 0)
  })

  await Promise.all(roomsDeletedPromises)
}
