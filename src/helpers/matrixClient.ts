import { CHAT_SERVER_NAME } from '../constants'
import { logger } from '../logger'
import { authedFetchJson, authedFetchResponse, wait } from '../utils'
import * as querystring from 'querystring'

export enum EventType {
  RoomCreate = 'm.room.create',
  RoomCAlias = 'm.room.canonical_alias',
  RoomCanonicalAlias = 'm.room.canonical_alias',
  RoomJoinRules = 'm.room.join_rules',
  RoomName = 'm.room.name',
  RoomTopic = 'm.room.topic',
  RoomAvatar = 'm.room.avatar',
  SpaceChild = 'm.space.child',
  SpaceParent = 'm.space.parent',
}

export enum Preset {
  PrivateChat = 'private_chat',
}

export enum Visibility {
  Private = 'private',
}

export enum RoomType {
  Space = 'm.space',
}

export enum ChatRoomEvent {
  SharedData = 'holi.room.shared.data',
  SpaceDeleted = 'holi.room.space.deleted',
}

type DeleteStatus = 'active' | 'shutting_down' | 'purging' | 'complete' | 'failed'

interface SpaceRoomSharedData {
  readonly holiSpaceId: string
}

export interface SpaceGeneralRoomSharedData extends SpaceRoomSharedData {
  readonly parentSpaceRoomId: string
  readonly spaceName: string
  readonly avatar: string
  readonly avatarDefaultColor: string
}

export type UknownRoomStateEvent = RoomStateEvent<Record<string, unknown>>

export interface RoomStateEvent<T extends RoomStateContent> {
  readonly type: `${EventType}`
  readonly event_id: string
  readonly room_id: string
  readonly user_id: string
  readonly state_key: string
  readonly sender: string
  readonly content: T
  readonly origin_server_ts: number
  readonly unsigned: unknown
  readonly age: number
  readonly replaces_state?: string
  readonly prev_content?: unknown
}

export type RoomStateContent =
  | RoomNameContent
  | RoomAvatarContent
  | RoomSpaceChildContent
  | RoomCreateContent
  | RoomCanonicalAliasContent
  | RoomGuestAccessContent
  | RoomJoinRulesContent
  | MembeshipContent
  | Record<string, unknown>

export interface RoomNameContent {
  readonly name: string
}

export interface RoomAvatarContent {
  readonly url: string | null
}

interface RoomCreateContent {
  readonly type: 'm.space'
  readonly room_version: string
  readonly creator: string
}

interface RoomSpaceChildContent {
  readonly via: unknown[]
}

interface RoomCanonicalAliasContent {
  readonly alias: string
}

interface RoomGuestAccessContent {
  readonly guest_access: string
}

interface RoomJoinRulesContent {
  readonly join_rule: string
}

interface MembeshipContent {
  readonly membership: string
  readonly displayname?: string
}

export const isSpaceGeneralRoomSharedData = (data: object): data is SpaceGeneralRoomSharedData => {
  return 'parentSpaceRoomId' in data && 'spaceName' in data
}

export const getMatrixId = (holiIdentity: string) => `@${holiIdentity}:${CHAT_SERVER_NAME}`

export const sendStateEvent = async (roomId: string, eventType: string, content: object, stateKey = '') => {
  return await authedFetchJson(`/_matrix/client/v3/rooms/${roomId}/state/${eventType}/${stateKey}`, 'PUT', content)
}

export const createRoom = async (content: object): Promise<{ room_id: string }> => {
  return (await authedFetchJson('/_matrix/client/v3/createRoom', 'POST', content)) as { room_id: string }
}

export const kick = async (roomId: string, matrixId: string, reason?: string) => {
  return await authedFetchResponse(`/_matrix/client/v3/rooms/${roomId}/kick`, 'POST', {
    user_id: matrixId,
    reason: reason,
  })
}

export const joinRoom = async (roomId: string, matrixId: string) => {
  for (let i = 1; i <= 10; i++) {
    const response = await authedFetchResponse(`/_synapse/admin/v1/join/${roomId}`, 'POST', {
      user_id: matrixId,
    })
    if (response.status === 200) {
      const joinedMember = await getRoomMember(roomId, matrixId, 'join')
      if (joinedMember) {
        return
      } else {
        logger.info(`The user is not joined in the room: ${matrixId}. Retry ${i} in 1s.`)
        wait(1000)
      }
    } else if (
      response.status >= 400 &&
      response.json.errcode === 'M_FORBIDDEN' &&
      response.json.error.includes('is already in the room')
    ) {
      logger.info('The user is already in the room: ' + matrixId)
      return
    } else if (response.status === 404 && response.json.errcode === 'M_NOT_FOUND') {
      logger.warn('The user does not exist on this server: ' + matrixId + '. Doing nothing.')
      return
    } else {
      throw new Error(`Matrix request failed with status ${response.status}: ${JSON.stringify(response.json)}`)
    }
  }
  throw new Error(`Member ${matrixId} still not joined after 10 retries. Giving up.`)
}

export const initRoomDeletion = async (roomId: string) => {
  const { delete_id } = (await authedFetchJson(`/_synapse/admin/v2/rooms/${roomId}`, 'DELETE', {
    purge: true,
    block: true,
  })) as { delete_id: string }
  return delete_id
}

export const getDeleteStatus = async (deleteId: string): Promise<DeleteStatus> => {
  const { status } = (await authedFetchJson(`/_synapse/admin/v2/rooms/delete_status/${deleteId}`, 'GET')) as {
    status: DeleteStatus
  }
  return status
}

export const getRooms = async (searchTerm: string, from?: string) => {
  const queryParams = {}
  if (from) queryParams['from'] = from
  if (searchTerm) queryParams['search_term'] = searchTerm
  const queryString = querystring.stringify(queryParams)
  return await authedFetchJson(`/_synapse/admin/v1/rooms${queryString ? '?' + queryString : ''}`, 'GET')
}

export const setDisplayName = async (displayname: string, matrixId: string) => {
  await authedFetchJson(`/_matrix/client/v3/profile/${matrixId}/displayname`, 'PUT', {
    displayname,
  })
}

export const setAvatarUrl = async (avatarUrl: string, matrixId: string) => {
  await authedFetchJson(`/_matrix/client/v3/profile/${matrixId}/avatar_url`, 'PUT', {
    avatar_url: avatarUrl || '',
  })
}

export const deactivateAccount = async (matrixId: string) => {
  const response = await authedFetchResponse(`/_synapse/admin/v1/deactivate/${matrixId}`, 'POST', { erase: true })
  if (response.status >= 300 && response.status !== 404)
    throw new Error(`Deactivating account did not succeed ${response.status}: ${response.json}`)
}

export const getRoomStateEvents = async (roomId: string): Promise<UknownRoomStateEvent[]> => {
  if (!roomId) return []
  return (await authedFetchJson('/_matrix/client/v3/rooms/' + roomId + '/state', 'GET')) as UknownRoomStateEvent[]
}

export const getSpaceRoomId = async (spaceSlug: string): Promise<string> => {
  const response = (await authedFetchResponse(
    '/_matrix/client/v3/directory/room/%23space_' + spaceSlug + '%3A' + CHAT_SERVER_NAME,
    'GET'
  )) as { status: number; json: { room_id: string } }
  if (response.status != 200) return undefined
  return response.json.room_id
}

export const getRoomMember = async (
  roomId: string,
  matrixId: string,
  status?: string
): Promise<RoomStateEvent<MembeshipContent>> => {
  const members = await getRoomMembers(roomId, status)
  const filteredMembers = members?.filter((m) => m.state_key === matrixId)
  return filteredMembers?.[0]
}

export const getRoomMembers = async (roomId: string, status?: string): Promise<RoomStateEvent<MembeshipContent>[]> => {
  const queryParams = {}
  if (status) queryParams['membership'] = status
  const queryString = querystring.stringify(queryParams)
  const json = (await authedFetchJson(
    `/_matrix/client/v3/rooms/${roomId}/members${queryString ? '?' + queryString : ''}`,
    'GET'
  )) as { chunk: RoomStateEvent<MembeshipContent>[] }
  return json?.chunk
}
