import { CHAT_SERVER_URL } from '../constants'
import { SpacePayload } from '../types'
import { setRoomSharedData } from './rooms'
import { ChatRoomEvent, EventType, Preset, RoomType, Visibility, createRoom, sendStateEvent } from './matrixClient'

export const createSpaceContainer = async ({ id, name }: SpacePayload, inviteUsers: string[]): Promise<string> => {
  const { room_id: parentSpaceRoomId } = await createRoom({
    name: name,
    preset: Preset.PrivateChat,
    visibility: Visibility.Private,
    is_direct: false,
    creation_content: {
      type: RoomType.Space,
    },
    invite: inviteUsers,
  })

  await sendStateEvent(parentSpaceRoomId, ChatRoomEvent.SharedData, { holiSpaceId: id })

  return parentSpaceRoomId
}

// Shares the new space with the user with the "admin" role
export const createSpaceGeneralRoom = async (inviteUsers: string[]): Promise<string> => {
  const { room_id: generalSpaceRoomId } = await createRoom({
    name: '#general',
    preset: Preset.PrivateChat,
    visibility: Visibility.Private,
    is_direct: false,
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
  await sendStateEvent(parentSpaceRoomId, EventType.SpaceChild, { via: [CHAT_SERVER_URL] }, generalSpaceRoomId)
}
