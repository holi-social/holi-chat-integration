import { logDebug, logInfo, logger } from '../logger'
import { SpaceUserAddedDataPayload } from '../types'
import { getMatrixId, kick } from './matrixClient'
import { getRoomIdsForHoliSpace } from './rooms'

const NUMBER_OF_RETRIES = 10
const RETRY_DELAY = 5000

export const kickUserFromSpace = async (
  messageId,
  { user: { identity }, space: { slug: holiSpaceSlug } }: SpaceUserAddedDataPayload
) => {
  const roomsIdsToLeave = await getRoomIdsForHoliSpace(holiSpaceSlug)
  if (roomsIdsToLeave.length == 0) {
    logDebug(messageId, 'kickUserFromSpace: No rooms found for space: ' + holiSpaceSlug)
    return
  }
  const userId = getMatrixId(identity)

  const roomsDeletedPromises = roomsIdsToLeave.map((roomId) => {
    async function kickUser(roomId, count) {
      logDebug(messageId, 'kickUserFromSpace: ' + holiSpaceSlug + ' - ' + roomId + ' - ' + identity)
      const resp = await kick(roomId, userId)
      if (resp.status == 403 && resp.json.errcode == 'M_FORBIDDEN') {
        count++
        if (count > NUMBER_OF_RETRIES) {
          logInfo(messageId, 'kickUserFromSpace: User ' + identity + ' not found. Giving up.')
          return
        }
        // try NUMBER_OF_RETRIES times every RETRY_DELAY ms, when the user is not found
        logDebug(
          messageId,
          'kickUserFromSpace: User ' + identity + ' not found. Retry ' + count + ' in ' + RETRY_DELAY + 'ms'
        )
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
        return await kickUser(roomId, count)
      }
    }
    return kickUser(roomId, 0)
  })

  await Promise.all(roomsDeletedPromises)
}
