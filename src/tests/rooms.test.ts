import { findStateEventByType, updateStateValue } from '../helpers/rooms'
import {
  NEW_ROOM_AVATAR_VALUE_FIXTURE,
  NEW_ROOM_NAME_VALUE_FIXTURE,
  ROOM_ID_FIXTURE,
  ROOM_STATE_EVENTS_FIXTURE,
} from '../fixtures/roomstate-fixture'
import { EventType, RoomAvatarContent, RoomNameContent, UknownRoomStateEvent } from '../helpers/matrixClient'
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
  const updateStateMock = jest.fn()

  beforeEach(() => {
    updateStateMock.mockReset()
  })

  it('should update incoming `m.room.name` events for a space and its one child', async () => {
    const childRoomId = 'child-room-id'
    const roomIds = [ROOM_ID_FIXTURE, childRoomId]
    const payload = SPACE_PAYLOAD_FIXTURE

    const avatarEvent = findStateEventByType<RoomNameContent>(EventType.RoomName, ROOM_STATE_EVENTS_FIXTURE)
    await updateStateValue(roomIds, payload.name, updateStateMock)

    expect(updateStateMock).toHaveBeenCalledTimes(2)
    expect(updateStateMock).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.name)
    expect(updateStateMock).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.name)
  })

  it('should update incoming `m.room.avatar` events for a space and its one child', async () => {
    const childRoomId = 'child-room-id'
    const roomIds = [ROOM_ID_FIXTURE, childRoomId]
    const payload = SPACE_PAYLOAD_FIXTURE

    const avatarEvent = findStateEventByType<RoomAvatarContent>(EventType.RoomAvatar, ROOM_STATE_EVENTS_FIXTURE)
    await updateStateValue(roomIds, payload.avatar, updateStateMock)

    expect(updateStateMock).toHaveBeenCalledTimes(2)
    expect(updateStateMock).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.avatar)
    expect(updateStateMock).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.avatar)
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
