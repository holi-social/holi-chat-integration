import { deleteUserById } from '../../ocis-api'
import { UserDeletedDataPayload } from '../../types'
import { findOcisUser } from '../helpers'
import { userDeletedHandler } from '../user-deleted-handler'

let deleteUserByIdMock: jest.MockedFunction<typeof deleteUserById>

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

describe('userDeletedHandler', () => {
  beforeEach(() => {
    deleteUserByIdMock = deleteUserById as jest.MockedFunction<typeof deleteUserById>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const userDeletedDataPayload: UserDeletedDataPayload = {
    user: {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'Test User',
    },
  }

  it('should delete oCIS user', async () => {
    const ocisUser = {
      id: 'ocis-user-id',
    }
    ;(findOcisUser as jest.Mock).mockResolvedValue(ocisUser)

    await userDeletedHandler(MESSAGE_ID, userDeletedDataPayload)

    expect(findOcisUser).toHaveBeenCalledWith(userDeletedDataPayload.user)
    expect(deleteUserByIdMock).toHaveBeenCalledWith(ocisUser.id)
  })

  it('should throw an error if any operation fails', async () => {
    const error = 'Failed to delete user'
    ;(findOcisUser as jest.Mock).mockRejectedValue(new Error(error))

    await expect(userDeletedHandler(MESSAGE_ID, userDeletedDataPayload)).rejects.toThrow(error)
  })
})
