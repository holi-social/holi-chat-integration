import { logDebug } from '../logger'
import { SpacePayload } from '../types'
import { deleteRoom, getRoomIdsForHoliSpace } from './rooms'

export const deleteSpaceRoom = async (messageId: string, { slug }: SpacePayload) => {
  const roomIdsToDelete = await getRoomIdsForHoliSpace(slug)

  const roomDeletion = roomIdsToDelete.map(async (roomId) => {
    logDebug(messageId, '**'.repeat(10) + ' FOUND ROOM TO DELETE ' + roomId)

    try {
      await deleteRoom(roomId)
      logDebug(messageId, '--'.repeat(10) + ' ROOM WAS DELETED ' + roomId)
    } catch (error) {
      logDebug(messageId, 'x*'.repeat(10) + ' ERROR OCCURED DURING DELETION ' + error)
      throw error
    }
  })

  return Promise.all(roomDeletion)
}
