import { logger } from '../../logger'
import { shareSpaceWithUser } from '../../ocis-api'
import { SpaceCreatedDataPayload, OcisRole } from '../../types'
import { findOrCreateOcisUser, findOrCreateOcisSpace } from '../helpers'
import { spaceCreatedHandler } from '../space-created-handler'

let loggerDebugMock: jest.MockedFunction<typeof logger.debug>

jest.mock('../../db')
jest.mock('../../ocis-api')
jest.mock('../helpers')

const MESSAGE_ID = '42'

describe('spaceCreatedHandler', () => {
  beforeEach(() => {
    loggerDebugMock = logger.debug as jest.MockedFunction<typeof logger.debug>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const spaceCreatedDataPayload: SpaceCreatedDataPayload = {
    creator: {
      id: 'creator-id',
      email: 'creator-email@example.com',
      name: 'Test Creator',
    },
    space: {
      id: 'space-id',
      name: 'Test Space',
      slug: 'test-space',
    },
  }

  it('should create a new space in oCIS and share it with the creator', async () => {
    const ocisUser = {
      id: 'ocis-user-id',
      onPremisesSamAccountName: 'holi_user-id',
    }
    const ocisSpace = {
      id: 'ocis-space-id',
    }
    ;(findOrCreateOcisUser as jest.Mock).mockResolvedValue(ocisUser)
    ;(findOrCreateOcisSpace as jest.Mock).mockResolvedValue(ocisSpace)
    ;(shareSpaceWithUser as jest.Mock).mockResolvedValue(null)

    await spaceCreatedHandler(MESSAGE_ID, spaceCreatedDataPayload)

    expect(findOrCreateOcisUser).toHaveBeenCalledWith(spaceCreatedDataPayload.creator)
    expect(findOrCreateOcisSpace).toHaveBeenCalledWith(spaceCreatedDataPayload.space)
    expect(shareSpaceWithUser).toHaveBeenCalledWith(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.EDITOR)
  })

  it('should throw an error if any operation fails', async () => {
    const error = 'Failed to create space'
    ;(findOrCreateOcisSpace as jest.Mock).mockRejectedValue(new Error(error))

    await expect(spaceCreatedHandler(MESSAGE_ID, spaceCreatedDataPayload)).rejects.toThrow(error)
  })
})
