import { deleteSpaceById } from '../../ocis-api'
import { SpaceDeletedDataPayload } from '../../types'
import { findOcisSpace } from '../helpers'
import { spaceDeletedHandler } from '../space-deleted-handler'

let deleteSpaceByIdMock: jest.MockedFunction<typeof deleteSpaceById>

jest.mock('../../db')
jest.mock('../../ocis-api')
jest.mock('../helpers')

jest.mock('../../logger', () => {
  return {
    logger: {
      debug: jest.fn(),
    },
    logPhase: jest.fn((_messageId: string, _phaseName: string) => (fn) => fn()),
  }
})

const MESSAGE_ID = '42'

describe('spaceDeletedHandler', () => {
  beforeEach(() => {
    deleteSpaceByIdMock = deleteSpaceById as jest.MockedFunction<typeof deleteSpaceById>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const spaceDeletedDataPayload: SpaceDeletedDataPayload = {
    space: {
      id: 'space-id',
      name: 'Test Space',
      slug: 'test-space',
    },
  }

  it('should delete oCIS space', async () => {
    const ocisSpace = {
      id: 'ocis-space-id',
    }
    ;(findOcisSpace as jest.Mock).mockResolvedValue(ocisSpace)

    await spaceDeletedHandler(MESSAGE_ID, spaceDeletedDataPayload)

    expect(findOcisSpace).toHaveBeenCalledWith(spaceDeletedDataPayload.space)
    expect(deleteSpaceByIdMock).toHaveBeenCalledWith(ocisSpace.id)
  })

  it('should throw an error if any operation fails', async () => {
    const error = 'Failed to delete space'
    ;(findOcisSpace as jest.Mock).mockRejectedValue(new Error(error))

    await expect(spaceDeletedHandler(MESSAGE_ID, spaceDeletedDataPayload)).rejects.toThrow(error)
  })
})
