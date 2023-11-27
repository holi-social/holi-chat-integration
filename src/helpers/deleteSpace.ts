import { SpacePayload } from '../types'
import { initRoomDeletion } from './matrixClient'
import { awaitDeletionComplete, getRoomIdsForHoliSpace } from './rooms'

export const deleteSpaceRoom = async ({ id }: SpacePayload) => {
  const roomIdsToDelete = await getRoomIdsForHoliSpace(id)

  const roomDeletion = roomIdsToDelete.map(async (roomId) => {
    console.debug('**'.repeat(10) + ' FOUND ROOM TO DELETE', roomId)

    try {
      const delete_id = await initRoomDeletion(roomId)
      await awaitDeletionComplete(roomId, delete_id)
      console.debug('--'.repeat(10) + ' ROOM WAS DELETED', roomId)
    } catch (error) {
      console.debug('x*'.repeat(10) + ' ERROR OCCURED DURING DELETION', error)
      throw error
    }
  })

  return Promise.all(roomDeletion)
}
