import { fetchWithAuth, fetchWithAuthX } from '../utils'

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

export const sendStateEvent = async (roomId: string, eventType: string, content: object, stateKey = '') => {
  return await fetchWithAuth(`/_matrix/client/v3/rooms/${roomId}/state/${eventType}/${stateKey}`, 'PUT', content)
}

export const createRoom = async (content: object): Promise<{ room_id: string }> => {
  return await fetchWithAuth('/_matrix/client/v3/createRoom', 'POST', content)
}

export const kick = async (roomId: string, userId: string, reason?: string) => {
  return await fetchWithAuthX(`/_matrix/client/v3/rooms/${roomId}/kick`, 'POST', {
    user_id: userId,
    reason: reason,
  })
}
