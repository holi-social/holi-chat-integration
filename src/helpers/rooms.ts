import { HOLI_CHAT_ADMIN_ACCESS_TOKEN, HOLI_CHAT_SERVER_URL } from '../constants'
import { ChatRoomEvent } from './type'

export const getMatrixUserId = (holiIdentity: string) => `@${holiIdentity}:local.chat.holi.social`

export const getRooms = async (searchTerm?: string) => {
  const resp = await fetch(
    `${HOLI_CHAT_SERVER_URL}/_synapse/admin/v1/rooms${searchTerm ? `?search_term=${searchTerm}` : ''}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${HOLI_CHAT_ADMIN_ACCESS_TOKEN}`,
      },
    }
  )

  const { rooms } = await resp.json()

  return rooms
}

export const getRoomSharedData = async (roomId: string) => {
  const resp = await fetch(`${HOLI_CHAT_SERVER_URL}/_synapse/admin/v1/rooms/${roomId}/state`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${HOLI_CHAT_ADMIN_ACCESS_TOKEN}`,
    },
  })

  const { state }: { state: (RoomSharedDataEvent | StateEvent)[] } = await resp.json()

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

interface SpaceSharedData {
  holiSpaceId: string
  parentSpaceRoomId: string
}

/**
 * Delete room helpers
 */
export const getRoomIdsForHoliSpace = async (holiSpaceId: string, searchTerm?: string) => {
  const rooms: { room_id: string }[] = await getRooms(searchTerm)

  return rooms.reduce<Promise<string[]>>(async (accPromise, room) => {
    let acc = await accPromise
    const { room_id } = room
    const state = await getRoomSharedData(room_id)
    const { content } = state.find(isRoomSharedDataEvent) ?? {}

    if (content && content.holiSpaceId === holiSpaceId) {
      acc = Array.from(new Set<string>([...acc, room_id, content.parentSpaceRoomId].filter((id) => !!id)))
    }

    return acc
  }, Promise.resolve([]))
}

interface DeleteStatus {
  status: 'active' | 'shutting_down' | 'purging' | 'complete' | 'failed'
}

export const awaitDeletionComplete = async (roomId, delete_id) => {
  const getDeleteStatus = async (deleteId: string) => {
    const resp = await fetch(`${HOLI_CHAT_SERVER_URL}/_synapse/admin/v2/rooms/delete_status/${deleteId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${HOLI_CHAT_ADMIN_ACCESS_TOKEN}`,
      },
    })

    const { status }: DeleteStatus = await resp.json()

    return status
  }
  try {
    console.debug('-*'.repeat(10) + ' ROOM IS DELETING', roomId)
    const status = await getDeleteStatus(delete_id)
    if (status !== 'complete') throw new Error('Deletion is not completed')
  } catch (error) {
    await new Promise((resolve) => setTimeout(resolve, 5000))
    return awaitDeletionComplete(roomId, delete_id)
  }
}

export const initRoomDeletion = async (roomId: string) => {
  const resp = await fetch(`${HOLI_CHAT_SERVER_URL}/_synapse/admin/v2/rooms/${roomId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${HOLI_CHAT_ADMIN_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      purge: true,
      block: true,
    }),
  })

  const { delete_id }: { delete_id: string } = await resp.json()

  return delete_id
}
