import { logger } from '../../logger'
import { createSpace, removeSpaceUser } from '../../ocis-api'
import { SpaceUserLeftDataPayload } from '../../types'
import { findOrCreateOcisSpace, findOrCreateOcisUser } from '../helpers'
import { spaceUserLeftHandler } from '../space-user-left-handler'

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

describe('spaceUserLeftHandler', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  const spaceUserLeftDataPayload: SpaceUserLeftDataPayload = {
    user: {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'Test User',
    },
    space: {
      id: 'space-id',
      name: 'Test Space',
      slug: 'test-space',
    },
  }

  it('should remove user from space', async () => {
    const ocisUser = {
      id: 'ocis-user-id',
      onPremisesSamAccountName: 'holi_user-id',
    }

    const ocisSpace = {
      id: 'ocis-space-id',
    }

    ;(findOrCreateOcisUser as jest.Mock).mockResolvedValue(ocisUser)
    ;(findOrCreateOcisSpace as jest.Mock).mockResolvedValue(ocisSpace)
    ;(removeSpaceUser as jest.Mock).mockResolvedValue(null)

    await spaceUserLeftHandler(MESSAGE_ID, spaceUserLeftDataPayload)

    expect(findOrCreateOcisUser).toHaveBeenCalledWith(spaceUserLeftDataPayload.user)
    expect(findOrCreateOcisSpace).toHaveBeenCalledWith(spaceUserLeftDataPayload.space)
    expect(removeSpaceUser).toHaveBeenCalledWith(ocisSpace.id, ocisUser.onPremisesSamAccountName)
    expect(logger.debug).toHaveBeenCalledWith('User removed from space successfully', { ocisUser, ocisSpace })
  })

  it('should throw an error if any operation fails', async () => {
    const error = 'Failed to remove user from space'

    ;(createSpace as jest.Mock).mockRejectedValue(new Error(error))

    await expect(spaceUserLeftHandler(MESSAGE_ID, spaceUserLeftDataPayload)).rejects.toThrow(error)
  })
})
