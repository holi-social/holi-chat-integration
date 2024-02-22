import { logDebug, logError, logInfo } from '../logger'
import { SpacePayload } from '../types'
import {
  ChatRoomEvent,
  EventType,
  getDeleteStatus,
  getRoomStateEvents,
  getSpaceRoomId,
  isSpaceGeneralRoomSharedData,
  RoomAvatarContent,
  RoomNameContent,
  RoomStateContent,
  RoomStateEvent,
  sendStateEvent,
  type SpaceGeneralRoomSharedData,
  type UknownRoomStateEvent,
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

export const setSpaceSharedData = async (roomId: string, { id }: SpacePayload) => {
  await sendStateEvent(roomId, ChatRoomEvent.SharedData, { holiSpaceId: id })
}

export const setChildRoomSharedData = async (
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
export const updateSpaceRoomSharedData = async (spaceRoomId: string, messageId: string, payload: SpacePayload) => {
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

  await setChildRoomSharedData(roomId, sharedData.parentSpaceRoomId, payload)
}

/**
 * @description The incoming Okuna events are handled and set in Matrix Space
 * Chat -> Space Chat children.
 */
export async function updateSpaceRoomNameAndAvatar(
  spaceRoomId: string,
  { avatar, name, slug }: SpacePayload
): Promise<void> {
  const events = await getRoomStateEvents(spaceRoomId)
  const roomIds = await getRoomIdsForHoliSpace(slug)

  const nameEvent = findStateEventByType<RoomNameContent>(EventType.RoomName, events)
  if (!nameEvent || name !== nameEvent.content.name) {
    await updateStateValue(roomIds, name, setRoomName)
  }

  const avatarEvent = findStateEventByType<RoomAvatarContent>(EventType.RoomAvatar, events)
  if (!!avatar && (!avatarEvent || avatar !== avatarEvent.content.url)) {
    await updateStateValue(roomIds, avatar, setRoomAvatar)
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
  const eventsCopy = Array.from(events)
  eventsCopy.reverse()
  const stateEvent = eventsCopy.find((event) => event.type === type) as RoomStateEvent<T> | undefined

  return stateEvent ?? null
}
