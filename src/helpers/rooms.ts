import { logDebug, logError, logInfo } from '../logger'
import { SpacePayload } from '../types'
import {
  ChatRoomEvent,
  EventType,
  type SpaceGeneralRoomSharedData,
  getDeleteStatus,
  getSpaceRoomId,
  getRoomStateEvents,
  isSpaceGeneralRoomSharedData,
  sendStateEvent,
  type UknownRoomStateEvent,
  RoomStateEvent,
  RoomStateContent,
  RoomAvatarContent,
  RoomNameContent,
} from './matrixClient'

export const getRoomChildren = async (roomId: string): Promise<string[]> => {
  if (!roomId) return []
  const roomState = await getRoomStateEvents(roomId)
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
  spaceRoomId: string
): Promise<readonly [string, SpaceGeneralRoomSharedData] | undefined> => {
  const roomIds = await getRoomChildren(spaceRoomId)

  const promises: Promise<readonly [string, SpaceGeneralRoomSharedData] | null>[] = roomIds.map(async (roomId) => {
    const roomStates = await getRoomStateEvents(roomId)
    const generalRoomState = roomStates.find((roomState) => isSpaceGeneralRoomSharedData(roomState.content))
    return generalRoomState && isSpaceGeneralRoomSharedData(generalRoomState.content)
      ? ([roomId, generalRoomState.content] as const)
      : null
  })

  const result = await Promise.all(promises)
  return result.find((roomResult) => roomResult != null)
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

export const setRoomName = async (roomId: string, roomName: string): Promise<void> => {
  await sendStateEvent(roomId, EventType.RoomName, {
    name: roomName,
  })
}

export const awaitDeletionComplete = async (messageId: string, roomId: string, delete_id: string) => {
  try {
    logDebug(messageId, '-*'.repeat(10) + ' ROOM IS DELETING ' + roomId)
    const status = await getDeleteStatus(delete_id)
    if (status !== 'complete') {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      return awaitDeletionComplete(messageId, roomId, delete_id)
    }
  } catch (error) {
    await new Promise((resolve) => setTimeout(resolve, 5000))
    return awaitDeletionComplete(messageId, roomId, delete_id)
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

/**
 * @description It processes the incoming payload for a Matrix Space Child
 * shared data state
 */
export const handleRoomSharedData = async (spaceRoomId: string, messageId: string, payload: SpacePayload) => {
  const sharedDataResult = await getGeneralRoomSharedDataForSpace(spaceRoomId)
  if (!sharedDataResult) {
    logInfo(
      messageId,
      'spaceUpdatedHandler - getHoliSpaceRoomsSharedData did not find a room for space ' + payload.slug
    )
    return
  }

  const [roomId, sharedData] = sharedDataResult

  if (!roomId || !sharedData) {
    logError(
      messageId,
      'spaceUpdatedHandler - getHoliSpaceRoomsSharedData roomId or sharedData is undefined processing event:' +
        JSON.stringify(payload, null, 4)
    )
    return
  }

  if (!isSpaceGeneralRoomSharedData(sharedData)) return
  if (!hasRoomUpdatedValues(sharedData, payload)) return

  await setRoomSharedData(roomId, sharedData.parentSpaceRoomId, payload)
}

/**
 * @description The incoming Okuna events are handled and set in Matrix Space
 * Chat -> Space Chat children.
 */
export async function handleRoomStateEvents(spaceRoomId: string, payload: SpacePayload): Promise<void> {
  const events = await getRoomStateEvents(spaceRoomId)
  const roomIds = await getRoomIdsForHoliSpace(payload.slug)

  if (!!payload.avatar) {
    const avatarEvent = findStateEventByType<RoomAvatarContent>(EventType.RoomAvatar, events)
    if (payload.avatar === avatarEvent.content.url) {
      await updateStateValue(roomIds, payload.avatar, setRoomAvatar)
    }
  }

  if (!!payload.name) {
    const avatarEvent = findStateEventByType<RoomNameContent>(EventType.RoomName, events)
    if (payload.name === avatarEvent.content.name) {
      await updateStateValue(roomIds, payload.avatar, setRoomAvatar)
    }
  }
}

export async function updateStateValue(
  roomIds: string[],
  value: string,
  callback: (roomId: string, value: string) => Promise<any>
): Promise<void> {
  try {
    for (const roomId of roomIds) {
      await callback(roomId, value)
    }
  } catch (err) {
    logError('spaceUpdatedHandler', 'failed to update room state event with value ' + value)
  }
}

/**
 * @description Copy-on-write function that reverses the events to get the
 * latest events first.
 */
export function findStateEventByType<T extends RoomStateContent>(
  type: EventType,
  events: UknownRoomStateEvent[]
): RoomStateEvent<T> | null {
  const stateEvent = Array.from(events)
    .reverse()
    .find((event) => event.type === type) as RoomStateEvent<T>

  return stateEvent ?? null
}
