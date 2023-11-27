import { CHAT_SERVER_NAME } from '../constants'
import { SpacePayload } from '../types'
import { EventType, sendStateEvent } from './matrixClient'
import { ChatRoomEvent } from './type'
import { fetchWithAuth } from '../utils'

export const getMatrixUserId = (holiIdentity: string) => `@${holiIdentity}:${CHAT_SERVER_NAME}`

export const getRooms = async (searchTerm?: string) => {
  const { rooms } = await fetchWithAuth(
    `/_synapse/admin/v1/rooms${searchTerm ? `?search_term=${searchTerm}` : ''}`,
    'GET'
  )
  return rooms
}

export const getRoomSharedData = async (roomId: string) => {
  const { state }: { state: (RoomSharedDataEvent | StateEvent)[] } = await fetchWithAuth(
    `/_synapse/admin/v1/rooms/${roomId}/state`,
    'GET'
  )
  return state
}

interface StateEvent {
  type: string
}

interface RoomSharedDataEvent {
  type: ChatRoomEvent.SharedData
  room_id: string
  sender: string
  content: SpaceSharedData
  state_key: string
  origin_server_ts: number
  unsigned: any
  event_id: string
  user_id: string
  age: number
}

const isRoomSharedDataEvent = (event: RoomSharedDataEvent | StateEvent): event is RoomSharedDataEvent =>
  event.type === ChatRoomEvent.SharedData

export const isSpaceGeneralRoomSharedData = (data: SpaceSharedData): data is SpaceGeneralRoomSharedData => {
  return 'parentSpaceRoomId' in data && 'spaceName' in data
}

interface SpaceRoomSharedData {
  holiSpaceId: string
}

interface SpaceGeneralRoomSharedData extends SpaceRoomSharedData {
  parentSpaceRoomId: string
  spaceName: string
  avatar: string
  avatarDefaultColor: string
}

export type SpaceSharedData = SpaceRoomSharedData | SpaceGeneralRoomSharedData

export const getHoliSpaceRoomsSharedData = async (
  holiSpaceId: string,
  searchTerm?: string
): Promise<Record<string, SpaceSharedData>> => {
  const rooms: { room_id: string; name: string }[] = await getRooms(searchTerm)

  return rooms.reduce<Promise<Record<string, SpaceSharedData>>>(async (accPromise, room) => {
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
  }, Promise.resolve({}))
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

/**
 * Delete room helpers
 */
interface DeleteStatus {
  status: 'active' | 'shutting_down' | 'purging' | 'complete' | 'failed'
}

export const awaitDeletionComplete = async (roomId, delete_id) => {
  const getDeleteStatus = async (deleteId: string) => {
    const { status }: DeleteStatus = await fetchWithAuth(`/_synapse/admin/v2/rooms/delete_status/${deleteId}`, 'GET')
    return status
  }
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

export const initRoomDeletion = async (roomId: string) => {
  const { delete_id }: { delete_id: string } = await fetchWithAuth(`/_synapse/admin/v2/rooms/${roomId}`, 'DELETE', {
    purge: true,
    block: true,
  })
  return delete_id
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
