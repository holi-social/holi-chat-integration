import * as room from '../helpers/rooms'
import * as mxClient from '../helpers/matrixClient'
import {
  ROOM_AVATAR_VALUE_FIXTURE,
  ROOM_NAME_VALUE_FIXTURE,
  ROOM_ID_FIXTURE,
  ROOM_STATE_EVENTS_FIXTURE,
} from '../fixtures/roomstate-fixture'
import { EventType, RoomAvatarContent, RoomNameContent, UknownRoomStateEvent } from '../helpers/matrixClient'
import { SpacePayload } from '../types'

const SPACE_PAYLOAD_FIXTURE: SpacePayload = {
  id: '',
  slug: '',
  avatarDefaultColor: '',
  name: 'Simplicity',
  avatar: 'https://unsplash.com/photos/a-man-standing-on-top-of-a-hill-with-the-sun-behind-him-8XCb_ffbBUY',
}

describe('Space Updates', () => {
  let updateStateMock: jest.Mock<any, any, any> = undefined
  let spySetRoomAvatar: jest.SpyInstance<Promise<unknown>, any, any> | undefined = undefined
  let spySetRoomName: jest.SpyInstance<Promise<unknown>, any, any> | undefined = undefined

  beforeEach(() => {
    updateStateMock = jest.fn()
    spySetRoomAvatar = jest.spyOn(room, 'setRoomAvatar').mockReturnValue(undefined)
    spySetRoomName = jest.spyOn(room, 'setRoomName').mockReturnValue(undefined)
  })

  afterEach(() => {
    updateStateMock.mockRestore()
    spySetRoomAvatar.mockRestore()
    spySetRoomName.mockRestore()
  })

  afterAll(() => {
    jest.restoreAllMocks()
    updateStateMock = undefined
    spySetRoomAvatar = undefined
    spySetRoomName = undefined
  })

  it('should update the `m.room.name` and `m.room.avatar` state', async () => {
    const childRoomId = 'child-room-id:local.chat.holi.social'
    const roomIds = [ROOM_ID_FIXTURE, childRoomId]

    jest.spyOn(mxClient, 'getRoomStateEvents').mockReturnValue(Promise.resolve(ROOM_STATE_EVENTS_FIXTURE))
    jest.spyOn(room, 'getRoomIdsForHoliSpace').mockReturnValue(Promise.resolve(roomIds))

    await room.updateSpaceRoomNameAndAvatar(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE)

    expect(spySetRoomAvatar).toHaveBeenCalledTimes(2)
    expect(spySetRoomAvatar).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.avatar)
    expect(spySetRoomAvatar).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.avatar)

    expect(spySetRoomName).toHaveBeenCalledTimes(2)
    expect(spySetRoomName).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.name)
    expect(spySetRoomName).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.name)
  })

  it('should only update the `m.room.name` state', async () => {
    const childRoomId = 'child-room-id:local.chat.holi.social'
    const roomIds = [ROOM_ID_FIXTURE, childRoomId]
    const payload: SpacePayload = {
      ...SPACE_PAYLOAD_FIXTURE,
      avatar: ROOM_AVATAR_VALUE_FIXTURE,
    }

    jest.spyOn(mxClient, 'getRoomStateEvents').mockReturnValue(Promise.resolve(ROOM_STATE_EVENTS_FIXTURE))
    jest.spyOn(room, 'getRoomIdsForHoliSpace').mockReturnValue(Promise.resolve(roomIds))

    await room.updateSpaceRoomNameAndAvatar(ROOM_ID_FIXTURE, payload)

    expect(spySetRoomAvatar).toHaveBeenCalledTimes(0)
    expect(spySetRoomName).toHaveBeenCalledTimes(2)
    expect(spySetRoomName).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.name)
    expect(spySetRoomName).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.name)
  })

  it('should only update `m.room.avatar` state', async () => {
    const childRoomId = 'child-room-id:local.chat.holi.social'
    const roomIds = [ROOM_ID_FIXTURE, childRoomId]
    const payload: SpacePayload = {
      ...SPACE_PAYLOAD_FIXTURE,
      name: ROOM_NAME_VALUE_FIXTURE,
    }

    jest.spyOn(mxClient, 'getRoomStateEvents').mockReturnValue(Promise.resolve(ROOM_STATE_EVENTS_FIXTURE))
    jest.spyOn(room, 'getRoomIdsForHoliSpace').mockReturnValue(Promise.resolve(roomIds))

    await room.updateSpaceRoomNameAndAvatar(ROOM_ID_FIXTURE, payload)

    expect(spySetRoomName).toHaveBeenCalledTimes(0)
    expect(spySetRoomAvatar).toHaveBeenCalledTimes(2)
    expect(spySetRoomAvatar).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.avatar)
    expect(spySetRoomAvatar).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.avatar)
  })

  it('should not update the none of the state values', async () => {
    const childRoomId = 'child-room-id:local.chat.holi.social'
    const roomIds = [ROOM_ID_FIXTURE, childRoomId]
    const payload: SpacePayload = {
      ...SPACE_PAYLOAD_FIXTURE,
      name: ROOM_NAME_VALUE_FIXTURE,
      avatar: ROOM_AVATAR_VALUE_FIXTURE,
    }

    jest.spyOn(mxClient, 'getRoomStateEvents').mockReturnValue(Promise.resolve(ROOM_STATE_EVENTS_FIXTURE))
    jest.spyOn(room, 'getRoomIdsForHoliSpace').mockReturnValue(Promise.resolve(roomIds))

    await room.updateSpaceRoomNameAndAvatar(ROOM_ID_FIXTURE, payload)

    expect(spySetRoomAvatar).toHaveBeenCalledTimes(0)
    expect(spySetRoomName).toHaveBeenCalledTimes(0)
  })

  it('should update both state values if the events are missing', async () => {
    const childRoomId = 'child-room-id:local.chat.holi.social'
    const roomIds = [ROOM_ID_FIXTURE, childRoomId]
    const payload = SPACE_PAYLOAD_FIXTURE

    jest.spyOn(mxClient, 'getRoomStateEvents').mockReturnValue(Promise.resolve([]))
    jest.spyOn(room, 'getRoomIdsForHoliSpace').mockReturnValue(Promise.resolve(roomIds))

    await room.updateSpaceRoomNameAndAvatar(ROOM_ID_FIXTURE, payload)

    expect(spySetRoomAvatar).toHaveBeenCalledTimes(2)
    expect(spySetRoomName).toHaveBeenCalledTimes(2)
  })

  it('should update `m.room.name` state value for the space and its one child - updateStateValue', async () => {
    const childRoomId = 'child-room-id'
    const roomIds = [ROOM_ID_FIXTURE, childRoomId]
    const payload = SPACE_PAYLOAD_FIXTURE

    const avatarEvent = room.findStateEventByType<RoomNameContent>(EventType.RoomName, ROOM_STATE_EVENTS_FIXTURE)
    await room.updateStateValue(roomIds, payload.name, updateStateMock)

    expect(updateStateMock).toHaveBeenCalledTimes(2)
    expect(updateStateMock).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.name)
    expect(updateStateMock).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.name)
  })

  it('should update `m.room.avatar` state value for the space and its one child - updateStateValue}', async () => {
    const childRoomId = 'child-room-id'
    const roomIds = [ROOM_ID_FIXTURE, childRoomId]
    const payload = SPACE_PAYLOAD_FIXTURE

    const avatarEvent = room.findStateEventByType<RoomAvatarContent>(EventType.RoomAvatar, ROOM_STATE_EVENTS_FIXTURE)
    await room.updateStateValue(roomIds, payload.avatar, updateStateMock)

    expect(updateStateMock).toHaveBeenCalledTimes(2)
    expect(updateStateMock).toHaveBeenCalledWith(ROOM_ID_FIXTURE, SPACE_PAYLOAD_FIXTURE.avatar)
    expect(updateStateMock).toHaveBeenCalledWith(childRoomId, SPACE_PAYLOAD_FIXTURE.avatar)
  })

  it('should find the `m.room.name` state event', () => {
    const nameEvent = room.findStateEventByType(EventType.RoomName, ROOM_STATE_EVENTS_FIXTURE)

    expect(nameEvent).toStrictEqual(
      expect.objectContaining({
        type: EventType.RoomName,
        content: {
          name: ROOM_NAME_VALUE_FIXTURE,
        },
      })
    )
  })

  it('should find the `m.room.avatar` state event', () => {
    const avatarEvent = room.findStateEventByType(EventType.RoomAvatar, ROOM_STATE_EVENTS_FIXTURE)

    expect(avatarEvent).toStrictEqual(
      expect.objectContaining({
        type: EventType.RoomAvatar,
        content: {
          url: ROOM_AVATAR_VALUE_FIXTURE,
        },
      })
    )
  })

  it('should not find the `m.room.name` state event', () => {
    const nameEvent = room.findStateEventByType(EventType.RoomName, [])
    expect(nameEvent).toBeNull()
  })

  it('should not find the `m.room.avatar` state event', () => {
    const nameEvent = room.findStateEventByType(EventType.RoomAvatar, [])
    expect(nameEvent).toBeNull()
  })
})
