import { CHAT_SERVER_URL } from '../constants'
import { SpacePayload } from '../types'
import {
  ChatRoomEvent,
  EventType,
  Preset,
  RoomType,
  Visibility,
  createRoom,
  joinRoom,
  sendStateEvent,
} from './matrixClient'
import { setChildRoomSharedData, setSpaceSharedData } from './rooms'

export const createSpaceContainer = async (spacePayload: SpacePayload, inviteUserId: string): Promise<string> => {
  const { id, name, slug } = spacePayload
  const { room_id: parentSpaceRoomId } = await createRoom({
    name: name,
    preset: Preset.PrivateChat,
    visibility: Visibility.Private,
    is_direct: false,
    creation_content: {
      type: RoomType.Space,
    },
    power_level_content_override: {
      events_default: 100, // prevents users from sending messages into the space room
      invite: 100, // only chat-admin can invite users
      state_default: 100, // only chat-admin can send state events
    },
    room_alias_name: 'space_' + slug, // set the canonical alias for this room
    invite: [inviteUserId],
  })

  // Auto join the holi space creator
  await joinRoom(parentSpaceRoomId, inviteUserId)
  await setSpaceSharedData(parentSpaceRoomId, spacePayload)
  return parentSpaceRoomId
}

// Shares the new space with the user with the "admin" role
export const createSpaceGeneralRoom = async (inviteUserId: string): Promise<string> => {
  const { room_id: generalSpaceRoomId } = await createRoom({
    name: '#general',
    preset: Preset.PrivateChat,
    visibility: Visibility.Private,
    is_direct: false,
    power_level_content_override: {
      invite: 100, // only chat-admin can invite users
      state_default: 100, // only chat-admin can send state events
    },
    invite: [inviteUserId],
  })

  // Auto join the holi space creator
  await joinRoom(generalSpaceRoomId, inviteUserId)
  return generalSpaceRoomId
}

export const addGeneralRoomToSpaceContainer = async (
  parentSpaceRoomId: string,
  generalSpaceRoomId: string,
  spacePayload: SpacePayload
): Promise<void> => {
  // add custom data to general room
  await setChildRoomSharedData(generalSpaceRoomId, parentSpaceRoomId, spacePayload)

  // add general room as child of space
  await sendStateEvent(parentSpaceRoomId, EventType.SpaceChild, { via: [CHAT_SERVER_URL] }, generalSpaceRoomId)

  // add space as parent of general room
  await sendStateEvent(
    generalSpaceRoomId,
    EventType.SpaceParent,
    { canonical: true, via: [CHAT_SERVER_URL] },
    parentSpaceRoomId
  )
}
