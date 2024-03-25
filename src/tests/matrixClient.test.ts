import { joinRoom } from '../helpers/matrixClient'
// import { authedFetchJson, authedFetchResponse } from '../utils'
import * as utils from '../utils'
import { logger } from '../logger'

jest.mock('../utils')

const createMock = <T extends {}, M extends jest.FunctionPropertyNames<Required<T>>>(module: T, method: M) => {
  const mockFn = jest.fn()
  jest.spyOn(module, method).mockImplementation(mockFn)
  return mockFn
}

describe('Matrix Client', () => {
  let authedFetchJsonMock: jest.Mock
  let authedFetchResponseMock: jest.Mock
  const roomId = '!someroomid:holi.social'
  const matrixId = '@someuser:holi.social'

  beforeEach(() => {
    authedFetchJsonMock = createMock(utils, 'authedFetchJson')
    authedFetchResponseMock = createMock(utils, 'authedFetchResponse')
    jest.useFakeTimers()
    // this disables all setTimeout waiting times and executes them immediately
    const setTimeoutMock = jest.fn()
    setTimeoutMock.mockImplementation((res) => res())
    global.setTimeout = setTimeoutMock as any
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('joinRoom checks join status successfully', async () => {
    authedFetchResponseMock.mockResolvedValue({ status: 200 })
    authedFetchJsonMock.mockResolvedValue({ chunk: [{ state_key: matrixId }] })
    await joinRoom(roomId, matrixId)
    expect(authedFetchResponseMock).toHaveBeenCalled()
    expect(authedFetchJsonMock).toHaveBeenCalled()
  })

  it('joinRoom checks join status multiple times until successfully', async () => {
    authedFetchResponseMock.mockResolvedValue({ status: 200 })
    authedFetchJsonMock.mockResolvedValueOnce({ chunk: [] })
    authedFetchJsonMock.mockResolvedValue({ chunk: [{ state_key: matrixId }] })
    await joinRoom(roomId, matrixId)
    expect(authedFetchResponseMock).toHaveBeenCalled()
    expect(authedFetchJsonMock).toHaveBeenCalledTimes(2)
  })

  it('joinRoom checks join status 10 times before giving up', async () => {
    authedFetchResponseMock.mockResolvedValue({ status: 200 })
    authedFetchJsonMock.mockResolvedValue({ chunk: [] })
    let thrown = false
    try {
      await joinRoom(roomId, matrixId)
    } catch (err) {
      expect(err.message).toContain('Giving up')
      thrown = true
    }
    expect(thrown).toBe(true)
    expect(authedFetchResponseMock).toHaveBeenCalled()
    expect(authedFetchJsonMock).toHaveBeenCalledTimes(10)
  })

  it('joinRoom returns when user is alreay in the room', async () => {
    authedFetchResponseMock.mockResolvedValue({
      status: 400,
      json: { errcode: 'M_FORBIDDEN', error: 'is already in the room' },
    })
    await joinRoom(roomId, matrixId)
    expect(authedFetchResponseMock).toHaveBeenCalled()
    expect(authedFetchJsonMock).not.toHaveBeenCalled()
  })

  it('joinRoom returns when the user is not found', async () => {
    authedFetchResponseMock.mockResolvedValue({
      status: 404,
      json: { errcode: 'M_NOT_FOUND' },
    })
    await joinRoom(roomId, matrixId)
    expect(authedFetchResponseMock).toHaveBeenCalled()
    expect(authedFetchJsonMock).not.toHaveBeenCalled()
  })

  it('joinRoom throws for other errors', async () => {
    authedFetchResponseMock.mockResolvedValue({
      status: 500,
      json: { errcode: 'M_NOT_FOUND' },
    })
    let thrown = false
    try {
      await joinRoom(roomId, matrixId)
    } catch (err) {
      expect(err.message).toContain('Matrix request failed with status 500')
      thrown = true
    }
    expect(thrown).toBe(true)
  })
})
