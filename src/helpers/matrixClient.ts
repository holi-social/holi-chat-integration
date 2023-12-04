import { CHAT_SERVER_NAME } from '../constants'
import { authedFetchJson, authedFetchResponse } from '../utils'
import * as querystring from 'querystring'

export enum EventType {
  RoomAvatar = 'm.room.avatar',
  SpaceChild = 'm.space.child',
  SpaceParent = 'm.space.parent',
}

export enum Preset {
  PrivateChat = 'private_chat',
  TrustedPrivateChat = 'trusted_private_chat',
  PublicChat = 'public_chat',
}

export enum Visibility {
  Public = 'public',
  Private = 'private',
}

export enum RoomType {
  Space = 'm.space',
  UnstableCall = 'org.matrix.msc3417.call',
  ElementVideo = 'io.element.video',
}

interface StateEvent {
  type: string
}

export enum ChatRoomEvent {
  SharedData = 'holi.room.shared.data',
  SpaceDeleted = 'holi.room.space.deleted',
}

interface SpaceRoomSharedData {
  holiSpaceId: string
}

export interface SpaceGeneralRoomSharedData extends SpaceRoomSharedData {
  parentSpaceRoomId: string
  spaceName: string
  avatar: string
  avatarDefaultColor: string
}

export type SpaceSharedData = SpaceRoomSharedData | SpaceGeneralRoomSharedData

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

interface RoomStateEvent {
  type: string
  event_id: string
  room_id: string
  user_id: string
  state_key: string
  sender: string
  content: object
  origin_server_ts: number
  unsigned: any
  age: number
}

interface DeleteStatus {
  status: 'active' | 'shutting_down' | 'purging' | 'complete' | 'failed'
}

export const isRoomSharedDataEvent = (event: RoomSharedDataEvent | StateEvent): event is RoomSharedDataEvent =>
  event.type === ChatRoomEvent.SharedData

export const isSpaceGeneralRoomSharedData = (data: object): data is SpaceGeneralRoomSharedData => {
  return 'parentSpaceRoomId' in data && 'spaceName' in data
}

export const getMatrixUserId = (holiIdentity: string) => `@${holiIdentity}:${CHAT_SERVER_NAME}`

export const sendStateEvent = async (roomId: string, eventType: string, content: object, stateKey = '') => {
  return await authedFetchJson(`/_matrix/client/v3/rooms/${roomId}/state/${eventType}/${stateKey}`, 'PUT', content)
}

export const createRoom = async (content: object): Promise<{ room_id: string }> => {
  return await authedFetchJson('/_matrix/client/v3/createRoom', 'POST', content)
}

export const kick = async (roomId: string, userId: string, reason?: string) => {
  return await authedFetchResponse(`/_matrix/client/v3/rooms/${roomId}/kick`, 'POST', {
    user_id: userId,
    reason: reason,
  })
}

export const joinRoom = async (roomId: string, userId: string) => {
  return await authedFetchJson(`/_synapse/admin/v1/join/${roomId}`, 'POST', {
    user_id: userId,
  })
}

export const initRoomDeletion = async (roomId: string) => {
  const { delete_id }: { delete_id: string } = await authedFetchJson(`/_synapse/admin/v2/rooms/${roomId}`, 'DELETE', {
    purge: true,
    block: true,
  })
  return delete_id
}

export const getDeleteStatus = async (deleteId: string) => {
  const { status }: DeleteStatus = await authedFetchJson(`/_synapse/admin/v2/rooms/delete_status/${deleteId}`, 'GET')
  return status
}

export const getRooms = async (searchTerm: string, from?: string) => {
  const queryParams = {}
  if (from) queryParams['from'] = from
  if (searchTerm) queryParams['search_term'] = searchTerm
  const queryString = querystring.stringify(queryParams)
  return await authedFetchJson(`/_synapse/admin/v1/rooms${queryString ? '?' + queryString : ''}`, 'GET')
}

export const setDisplayName = async (displayname: string, userId: string) => {
  await authedFetchJson(`/_matrix/client/v3/profile/${userId}/displayname`, 'PUT', {
    displayname,
  })
}

export const setAvatarUrl = async (avatarUrl: string, userId: string) => {
  await authedFetchJson(`/_matrix/client/v3/profile/${userId}/avatar_url`, 'PUT', {
    avatar_url: avatarUrl || '',
  })
}

export const deactivateAccount = async (userId: string) => {
  const response = await authedFetchResponse(`/_synapse/admin/v1/deactivate/${userId}`, 'POST', { erase: true })
  if (response.status >= 300 && response.status !== 404)
    throw new Error(`Deactivating account did not succeed ${response.status}: ${response.json}`)
}

export const isUsernameAvailable = async (localpart: string) => {
  const response = await authedFetchResponse(`/_synapse/admin/v1/username_available?username=${localpart}`, 'GET')
  return response.status === 200
}

export const getRoomStates = async (roomId: string): Promise<RoomStateEvent[]> => {
  if (!roomId) return []
  return await authedFetchJson('/_matrix/client/v3/rooms/' + roomId + '/state', 'GET')
}

export const getSpaceRoomId = async (spaceSlug: string): Promise<string> => {
  const response = await authedFetchResponse(
    '/_matrix/client/v3/directory/room/%23space_' + spaceSlug + '%3A' + CHAT_SERVER_NAME,
    'GET'
  )
  if (response.status != 200) return undefined
  return response.json.room_id
}
