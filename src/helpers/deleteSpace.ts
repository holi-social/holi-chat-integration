import { logDebug } from '../logger'
import { SpacePayload } from '../types'
import { initRoomDeletion } from './matrixClient'
import { awaitDeletionComplete, getRoomIdsForHoliSpace } from './rooms'

export const deleteSpaceRoom = async (messageId: string, { slug }: SpacePayload) => {
  const roomIdsToDelete = await getRoomIdsForHoliSpace(slug)

  const roomDeletion = roomIdsToDelete.map(async (roomId) => {
    logDebug(messageId, '**'.repeat(10) + ' FOUND ROOM TO DELETE ' + roomId)

    try {
      const delete_id = await initRoomDeletion(roomId)
      await awaitDeletionComplete(messageId, roomId, delete_id)
      logDebug(messageId, '--'.repeat(10) + ' ROOM WAS DELETED ' + roomId)
    } catch (error) {
      logDebug(messageId, 'x*'.repeat(10) + ' ERROR OCCURED DURING DELETION ' + error)
      throw error
    }
  })

  return Promise.all(roomDeletion)
}
