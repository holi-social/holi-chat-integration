import { Preset, Visibility, EventType, RoomType } from 'matrix-js-sdk'

import { getChatClient } from './_chatClient'
import { CHAT_SERVER_URL } from '../constants'
import { SpacePayload } from '../types'
import { ChatRoomEvent } from './type'
import { setRoomSharedData } from './rooms'

export const createSpaceContainer = async ({ id, name }: SpacePayload, inviteUsers: string[]): Promise<string> => {
  const chatClient = await getChatClient()
  const { room_id: parentSpaceRoomId } = await chatClient.createRoom({
    name: name,
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
  const chatClient = await getChatClient()
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
  spacePayload: SpacePayload
): Promise<void> => {
  // 1. add custom data into general room
  await setRoomSharedData(generalSpaceRoomId, parentSpaceRoomId, spacePayload)

  // 2. add general room into space room
  const chatClient = await getChatClient()
  await chatClient.sendStateEvent(
    parentSpaceRoomId,
    EventType.SpaceChild,
    { via: [CHAT_SERVER_URL] },
    generalSpaceRoomId
  )
}
