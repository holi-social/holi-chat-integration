import { findStateEventByType, getDataFromEventType, handleRoomStateEvent, hasSameEventContent } from '../helpers/rooms'
import {
  NEW_ROOM_AVATAR_VALUE_FIXTURE,
  NEW_ROOM_NAME_VALUE_FIXTURE,
  ROOM_ID_FIXTURE,
  ROOM_STATE_EVENTS_FIXTURE,
} from '../fixtures/roomstate-fixture'
import { EventType, UknownRoomStateEvent } from '../helpers/matrixClient'
import { SpacePayload } from '../types'

const SPACE_PAYLOAD_FIXTURE: SpacePayload = {
  id: '',
  slug: '',
  avatarDefaultColor: '',
  name: 'latest name',
  avatar: 'https://unsplash.com/photos/a-man-standing-on-top-of-a-hill-with-the-sun-behind-him-8XCb_ffbBUY',
}

const SPACE_WITH_SAME_CONTENT_PAYLOAD_FIXTURE: SpacePayload = {
  id: '',
  slug: '',
  avatarDefaultColor: '',
  name: NEW_ROOM_NAME_VALUE_FIXTURE,
  avatar: NEW_ROOM_AVATAR_VALUE_FIXTURE,
}

describe('Space Updates', () => {
  const setStateMock = jest.fn()

  beforeEach(() => {
    setStateMock.mockReset()
  })

  it('should handle incoming `m.room.name` events for a space and its one child', async () => {
    const childRoomId = 'child-room-id'

    await handleRoomStateEvent(ROOM_ID_FIXTURE, {
      callback: setStateMock,
      childRoomIds: [childRoomId],
      eventType: EventType.RoomName,
      events: ROOM_STATE_EVENTS_FIXTURE,
      payload: SPACE_PAYLOAD_FIXTURE,
    })

    expect(setStateMock).toHaveBeenCalledTimes(2)
    expect(setStateMock).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.name)
    expect(setStateMock).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.name)
  })

  it('should handle incoming `m.room.avatar` events for a space and its one child', async () => {
    const childRoomId = 'child-room-id'

    await handleRoomStateEvent(ROOM_ID_FIXTURE, {
      callback: setStateMock,
      childRoomIds: [childRoomId],
      eventType: EventType.RoomAvatar,
      events: ROOM_STATE_EVENTS_FIXTURE,
      payload: SPACE_PAYLOAD_FIXTURE,
    })

    expect(setStateMock).toHaveBeenCalledTimes(2)
    expect(setStateMock).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.avatar)
    expect(setStateMock).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.avatar)
  })

  it('should get the value based on the event type', () => {
    expect(getDataFromEventType(EventType.RoomAvatar, SPACE_PAYLOAD_FIXTURE)).toBe(SPACE_PAYLOAD_FIXTURE.avatar)
    expect(getDataFromEventType(EventType.RoomName, SPACE_PAYLOAD_FIXTURE)).toBe(SPACE_PAYLOAD_FIXTURE.name)
  })

  it('should handle `m.room.name` event content comparison', () => {
    const nameEvent = findStateEventByType(EventType.RoomName, ROOM_STATE_EVENTS_FIXTURE) as UknownRoomStateEvent

    expect(nameEvent).not.toBeNull()
    expect(hasSameEventContent(nameEvent, SPACE_PAYLOAD_FIXTURE)).toBeFalsy()
    expect(hasSameEventContent(nameEvent, SPACE_WITH_SAME_CONTENT_PAYLOAD_FIXTURE)).toBeTruthy()
  })

  it('should handle `m.room.avatar` event content comparison', () => {
    const avatarEvent = findStateEventByType(EventType.RoomAvatar, ROOM_STATE_EVENTS_FIXTURE) as UknownRoomStateEvent

    expect(avatarEvent).not.toBeNull()
    expect(hasSameEventContent(avatarEvent, SPACE_PAYLOAD_FIXTURE)).toBeFalsy()
    expect(hasSameEventContent(avatarEvent, SPACE_WITH_SAME_CONTENT_PAYLOAD_FIXTURE)).toBeTruthy()
  })

  it('should find the `m.room.name` state event', () => {
    const nameEvent = findStateEventByType(EventType.RoomName, ROOM_STATE_EVENTS_FIXTURE)

    expect(nameEvent).toStrictEqual(
      expect.objectContaining({
        type: EventType.RoomName,
        content: {
          name: NEW_ROOM_NAME_VALUE_FIXTURE,
        },
      })
    )
  })

  it('should find the `m.room.avatar` state event', () => {
    const avatarEvent = findStateEventByType(EventType.RoomAvatar, ROOM_STATE_EVENTS_FIXTURE)

    expect(avatarEvent).toStrictEqual(
      expect.objectContaining({
        type: EventType.RoomAvatar,
        content: {
          url: NEW_ROOM_AVATAR_VALUE_FIXTURE,
        },
      })
    )
  })
})
