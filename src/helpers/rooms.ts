import { SpacePayload } from '../types'
import {
  ChatRoomEvent,
  EventType,
  SpaceGeneralRoomSharedData,
  getDeleteStatus,
  getSpaceRoomId,
  getRoomStates,
  isSpaceGeneralRoomSharedData,
  sendStateEvent,
} from './matrixClient'

interface Room {
  room_id: string
  name: string
}

const getRoomChildren = async (roomId: string): Promise<string[]> => {
  if (!roomId) return []
  const roomState = await getRoomStates(roomId)
  return roomState.filter((state) => state.type === EventType.SpaceChild).map((state) => state.state_key)
}

export const getRoomIdsForHoliSpace = async (spaceSlug: string): Promise<string[]> => {
  const spaceRoomId = await getSpaceRoomId(spaceSlug)
  if (!spaceRoomId) return []
  const roomIds = await getRoomChildren(spaceRoomId)
  roomIds.push(spaceRoomId)
  return roomIds
}

export const getGeneralRoomSharedDataForSpace = async (
  spaceSlug: string
): Promise<[string, SpaceGeneralRoomSharedData]> => {
  const spaceRoomId = await getSpaceRoomId(spaceSlug)
  const roomIds = await getRoomChildren(spaceRoomId)
  roomIds.forEach(async (roomId) => {
    const roomStates = await getRoomStates(roomId)
    const generalRoomState = roomStates.find((roomState) => isSpaceGeneralRoomSharedData(roomState.content))
    return [roomId, generalRoomState]
  })
  return undefined
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
