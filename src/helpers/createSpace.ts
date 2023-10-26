import { Preset, Visibility, EventType, RoomType } from 'matrix-js-sdk'

import { chatClient } from './_chatClient'
import { CHAT_SERVER_URL } from '../constants'
import { SpacePayload } from '../types'
import { ChatRoomEvent } from './type'

export const createSpaceContainer = async ({ id, name }: SpacePayload, inviteUsers: string[]): Promise<string> => {
  const { room_id: parentSpaceRoomId } = await chatClient.createRoom({
    name: name,
    room_alias_name: name.toLowerCase().replace(/[ ]/g, '.').trim(),
    preset: Preset.PrivateChat,
    visibility: Visibility.Private,
    is_direct: false,
    creation_content: {
      type: RoomType.Space,
    },
    invite: inviteUsers,
  })

  await chatClient.sendStateEvent(parentSpaceRoomId, ChatRoomEvent.SharedData, { holiSpaceId: id })

  return parentSpaceRoomId
}

// Shares the new space with the user with the "admin" role
export const createSpaceGeneralRoom = async (inviteUsers: string[]): Promise<string> => {
  const { room_id: generalSpaceRoomId } = await chatClient.createRoom({
    is_direct: false,
    preset: Preset.PrivateChat,
    visibility: Visibility.Private,
    name: '#general',
    invite: inviteUsers,
  })

  return generalSpaceRoomId
}

export const addGeneralRoomToSpaceContainer = async (
  parentSpaceRoomId: string,
  generalSpaceRoomId: string,
  { id, name, avatarDefaultColor }: SpacePayload
): Promise<void> => {
  // 1. add custom data into general room
  await chatClient.sendStateEvent(generalSpaceRoomId, ChatRoomEvent.SharedData, {
    holiSpaceId: id,
    spaceName: name,
    avatarDefaultColor,
    parentSpaceRoomId,
  })

  // 2. add general room into space room
  await chatClient.sendStateEvent(
    parentSpaceRoomId,
    EventType.SpaceChild,
    { via: [CHAT_SERVER_URL] },
    generalSpaceRoomId
  )
}
