import { SpacePayload } from '../types'
import {
  ChatRoomEvent,
  EventType,
  SpaceGeneralRoomSharedData,
  SpaceSharedData,
  getDeleteStatus,
  getRoomSharedData,
  getRooms,
  isRoomSharedDataEvent,
  sendStateEvent,
} from './matrixClient'

interface Room {
  room_id: string
  name: string
}

export const getHoliSpaceRoomsSharedData = async (
  holiSpaceId: string,
  searchTerm?: string
): Promise<Record<string, SpaceSharedData>> => {
  var nextBatch = undefined
  var result = {}
  do {
    const { rooms, next_batch }: { rooms: Room[]; next_batch: string } = await getRooms(nextBatch, searchTerm)
    nextBatch = next_batch

    result = await rooms.reduce<Promise<Record<string, SpaceSharedData>>>(async (accPromise, room) => {
      let acc = await accPromise
      const { room_id } = room
      const state = await getRoomSharedData(room_id)
      const { content } = state.find(isRoomSharedDataEvent) ?? {}

      return content && content.holiSpaceId === holiSpaceId
        ? {
            ...acc,
            [room_id]: content,
          }
        : acc
    }, Promise.resolve(result))
  } while (nextBatch)
  return result
}

export const getRoomIdsForHoliSpace = async (holiSpaceId: string, searchTerm?: string): Promise<string[]> => {
  const holiSpaceRoomsRecord = await getHoliSpaceRoomsSharedData(holiSpaceId, searchTerm)
  return Object.keys(holiSpaceRoomsRecord)
}

/**
 * Create room helpers
 */
export const setRoomSharedData = async (
  roomId: string,
  parentSpaceRoomId: string,
  { id, name, avatarDefaultColor }: SpacePayload
) => {
  await sendStateEvent(roomId, ChatRoomEvent.SharedData, {
    holiSpaceId: id,
    spaceName: name,
    avatarDefaultColor,
    parentSpaceRoomId,
  })
}

export const awaitDeletionComplete = async (roomId: string, delete_id: string) => {
  try {
    console.debug('-*'.repeat(10) + ' ROOM IS DELETING', roomId)
    const status = await getDeleteStatus(delete_id)
    if (status !== 'complete') {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      return awaitDeletionComplete(roomId, delete_id)
    }
  } catch (error) {
    await new Promise((resolve) => setTimeout(resolve, 5000))
    return awaitDeletionComplete(roomId, delete_id)
  }
}

/**
 * Update room helpers
 */
export const hasRoomUpdatedValues = (
  oldSharedData: SpaceGeneralRoomSharedData,
  spacePayload: SpacePayload
): boolean => {
  const { spaceName, avatar, avatarDefaultColor } = oldSharedData
  const { name: newSpaceName, avatar: newAvatar, avatarDefaultColor: newAvatarDefaultColor } = spacePayload
  return spaceName !== newSpaceName || avatar !== newAvatar || avatarDefaultColor !== newAvatarDefaultColor
}

export const setRoomAvatar = async (roomId: string, avatarUrl: string) => {
  return await sendStateEvent(roomId, EventType.RoomAvatar, { url: avatarUrl })
}
