import { AxiosResponse } from 'axios'
import {
  assignUserRole,
  client,
  createSpace,
  createUser,
  deleteSpaceById,
  disableSpaceById,
  deleteUserById,
  findSpaceById,
  findUserByAccountName,
  findUserById,
  shareSpaceWithUser,
  removeSpaceUser,
  updateUser,
} from '../ocis-api'
import {
  OcisApi,
  OcisLibreGraphRoute,
  OcisRole,
  OcisShareType,
  OcisSpace,
  OcisUser,
  OcisUserType,
  SpacePayload,
  UserPayload,
} from '../types'
import { HOLI_PREFIX, MAX_SPACE_QUOTA } from '../constants'

const mockedAxios = client as jest.Mocked<typeof client>

mockedAxios.get = jest.fn()
mockedAxios.post = jest.fn()
mockedAxios.patch = jest.fn()
mockedAxios.delete = jest.fn()

describe('/users', () => {
  const id = 'test-user-id'
  const userPayload: UserPayload = {
    id,
    name: 'Test User',
    email: 'test-email@example.com',
  }
  const data: OcisUser = {
    id,
    onPremisesSamAccountName: 'test-username',
    mail: 'test-email@example.com',
    displayName: 'Test User',
    accountEnabled: true,
    givenName: '',
    surname: '',
    userType: OcisUserType.MEMBER,
  }

  describe('findUserById', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should return the user data when the request is successful', async () => {
      const response: AxiosResponse<OcisUser> = {
        data: data,
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        config: undefined,
      }
      mockedAxios.get.mockResolvedValueOnce(response)

      const user = await findUserById(id)

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining(id), expect.any(Object))
      expect(user).toEqual(data)
    })

    it('should return null when the user is not found', async () => {
      const response = {
        response: {
          status: 404,
        },
      }
      mockedAxios.get.mockRejectedValueOnce(response)

      const user = await findUserById(id)

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining(id), expect.any(Object))
      expect(user).toBeUndefined()
    })

    it('should throw an error when the request fails with a 500 status', async () => {
      const response = {
        response: {
          status: 500,
        },
      }
      mockedAxios.get.mockRejectedValueOnce(response)

      await expect(findUserById(id)).rejects.toThrowError(`Failed to find an oCIS user with ID ${id}`)
    })
  })

  describe('findUserByAccountName', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should return the user data when the request is successful', async () => {
      const response: AxiosResponse<OcisUser> = {
        data: data,
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        config: undefined,
      }
      mockedAxios.get.mockResolvedValueOnce(response)

      const user = await findUserByAccountName(id)

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining(id), expect.any(Object))
      expect(user).toEqual(data)
    })

    it('should return null when the user is not found', async () => {
      const response = {
        response: {
          status: 404,
        },
      }
      mockedAxios.get.mockRejectedValueOnce(response)

      const user = await findUserByAccountName(id)

      expect(user).toBeUndefined()
    })

    it('should throw an error when the request fails with a 500 status', async () => {
      const response = {
        response: {
          status: 500,
        },
      }
      mockedAxios.get.mockRejectedValueOnce(response)

      await expect(findUserByAccountName(id)).rejects.toThrowError(
        `Failed to find an oCIS user with account name ${HOLI_PREFIX}_${id}`
      )
    })
  })

  describe('createUser', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should create a user and return the created user data', async () => {
      const response: AxiosResponse<OcisUser> = {
        data: data,
        status: 201,
        statusText: 'Created',
        headers: { 'Content-Type': 'application/json' },
        config: undefined,
      }
      mockedAxios.post.mockResolvedValueOnce(response)

      const user = await createUser(userPayload)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining(OcisLibreGraphRoute.USERS),
        {
          mail: 'test-user-id@holi.team',
          displayName: 'Test User',
          onPremisesSamAccountName: 'holi_test-user-id',
          userType: OcisUserType.MEMBER,
          identities: expect.any(Array),
        },
        {
          headers: { 'Content-Type': 'application/json' },
          auth: expect.any(Object),
          httpsAgent: expect.any(Object),
        }
      )
      expect(user).toEqual(data)
    })

    it('should throw an error if user creation fails', async () => {
      const error = new Error('User creation failed')
      mockedAxios.post.mockRejectedValueOnce(error)

      await expect(createUser(userPayload)).rejects.toThrowError(
        `Failed to create an oCIS account for user with ID ${userPayload.id}`
      )
    })
  })

  describe('updateUser', () => {
    const userPaylaod: UserPayload = {
      id: 'test-user-id',
      name: 'New Test User',
      email: 'test-email@example.com',
    }

    const ocisUserId = 'ocis-user-id'

    const data: OcisUser = {
      id: ocisUserId,
      onPremisesSamAccountName: 'holi_test-user-id',
      mail: 'test-user-id@holi.team',
      displayName: 'New Test User',
      accountEnabled: true,
      givenName: '',
      surname: '',
      userType: OcisUserType.MEMBER,
    }
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should update a user and return the updated user data', async () => {
      const response: AxiosResponse<OcisUser> = {
        data,
        status: 201,
        statusText: 'Created',
        headers: { 'Content-Type': 'application/json' },
        config: undefined,
      }
      mockedAxios.patch.mockResolvedValueOnce(response)

      const user = await updateUser(ocisUserId, userPaylaod)

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining(`${OcisLibreGraphRoute.USERS}/${ocisUserId}`),
        {
          displayName: 'New Test User',
        },
        {
          headers: { 'Content-Type': 'application/json' },
          auth: expect.any(Object),
          httpsAgent: expect.any(Object),
        }
      )
      expect(user).toEqual(data)
    })

    it('should throw an error if user update fails', async () => {
      const error = new Error('User update failed')
      mockedAxios.patch.mockRejectedValueOnce(error)

      await expect(updateUser(ocisUserId, userPaylaod)).rejects.toThrowError(
        `Failed to update oCIS account for user with ID ${userPaylaod.id}`
      )
    })
  })

  describe('assignUserRole', () => {
    const userId = 'ocis-test-user-id'
    const roleId = 'role-id'
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should assign a role to a user', async () => {
      const response = 'success'
      mockedAxios.post.mockResolvedValueOnce(response)

      await assignUserRole(userId, roleId)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/assignments-add'),
        {
          account_uuid: userId,
          role_id: roleId,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          auth: expect.any(Object),
          httpsAgent: expect.any(Object),
        }
      )
    })

    it('should throw an error if role assignment fails', async () => {
      const error = new Error('Role assignment failed')
      mockedAxios.post.mockRejectedValueOnce(error)

      await expect(assignUserRole(userId, roleId)).rejects.toThrowError(
        `Failed to assign role ${roleId} to user ${userId}`
      )
    })
  })

  describe('deleteUserById', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should delete a user', async () => {
      const response: AxiosResponse = {
        data: undefined,
        status: 204,
        statusText: 'No Content',
        config: undefined,
        headers: undefined,
      }
      mockedAxios.delete.mockResolvedValueOnce(response)

      await deleteUserById(id)

      expect(mockedAxios.delete).toHaveBeenCalledWith(expect.stringContaining(`${OcisLibreGraphRoute.USERS}/${id}`), {
        auth: expect.any(Object),
        httpsAgent: expect.any(Object),
      })
    })

    it('should throw an error if user creation fails', async () => {
      const error = new Error('User deletion failed')
      mockedAxios.delete.mockRejectedValueOnce(error)

      await expect(deleteUserById(id)).rejects.toThrowError(`Failed to delete user with ID ${id}`)
    })
  })
})
describe('/drives', () => {
  describe('createSpace', () => {
    const spacePayload: SpacePayload = {
      id: 'test-space-id',
      name: 'Test Space',
      slug: 'test-space',
    }

    const data: OcisSpace = {
      driveAlias: 'test-space-id',
      driveType: 'project',
      id: 'test-drive-id',
      lastModifiedDateTime: '',
      name: 'Test Space',
      owner: {
        user: {
          displayName: 'Test User',
          id: 'test-user-id',
        },
      },
      quota: {
        remaining: MAX_SPACE_QUOTA,
        state: 'normal',
        total: MAX_SPACE_QUOTA,
        used: 0,
      },
      root: {
        eTag: 'test-space-root-etag',
        id: 'test-space-root-id',
        permissions: [
          {
            grantedTo: [
              {
                user: {
                  displayName: 'Test User',
                  id: 'test-user-id',
                },
              },
            ],
            roles: ['manager'],
          },
        ],
        webDavUrl: 'test-web-dav-url',
      },
      webUrl: 'test-web-url',
    }
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should create a space and return the created space data', async () => {
      const response: AxiosResponse<OcisSpace> = {
        data,
        status: 201,
        statusText: 'Created',
        headers: { 'Content-Type': 'application/json' },
        config: undefined,
      }
      mockedAxios.post.mockResolvedValueOnce(response)

      const space = await createSpace(spacePayload)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining(OcisLibreGraphRoute.DRIVES),
        {
          name: spacePayload.name,
          driveAlias: spacePayload.slug,
          quota: {
            total: MAX_SPACE_QUOTA,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          auth: expect.any(Object),
          httpsAgent: expect.any(Object),
        }
      )
      expect(space).toEqual(data)
    })

    it('should throw an error if space creation fails', async () => {
      const error = new Error('Space creation failed')
      mockedAxios.post.mockRejectedValueOnce(error)

      await expect(createSpace(spacePayload)).rejects.toThrowError(
        `Failed to create an oCIS drive for space ${spacePayload.id}`
      )
    })
  })

  describe('shareSpaceWithUser', () => {
    const spaceId = 'test-space-id'
    const username = 'test-user-username'
    const role = OcisRole.EDITOR

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should share a space and assign a role to a user', async () => {
      // Set up mock Axios response.
      const response = 'success'

      mockedAxios.post.mockResolvedValueOnce(response)

      await shareSpaceWithUser(spaceId, username, role)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining(OcisApi.SHARE_API_PATH),
        `space_ref=${spaceId}&shareType=${OcisShareType.SHARE_SPACE}&shareWith=${username}&role=${role}`,
        {
          auth: expect.any(Object),
          httpsAgent: expect.any(Object),
        }
      )
    })

    it('should throw an error if space sharing fails', async () => {
      const error = new Error('Space sharing failed')
      mockedAxios.post.mockRejectedValueOnce(error)

      await expect(shareSpaceWithUser(spaceId, username, role)).rejects.toThrowError(
        `Failed to share the oCIS space ${spaceId} with user ${username}`
      )
    })
  })

  describe('findSpaceById', () => {
    const id = 'test-space-id'

    const data: OcisSpace = {
      driveAlias: 'test-space-id',
      driveType: 'project',
      id: 'test-drive-id',
      lastModifiedDateTime: '',
      name: 'Test Space',
      owner: {
        user: {
          displayName: 'Test User',
          id: 'test-user-id',
        },
      },
      quota: {
        remaining: MAX_SPACE_QUOTA,
        state: 'normal',
        total: MAX_SPACE_QUOTA,
        used: 0,
      },
      root: {
        eTag: 'test-space-root-etag',
        id: 'test-space-root-id',
        permissions: [
          {
            grantedTo: [
              {
                user: {
                  displayName: 'Test User',
                  id: 'test-user-id',
                },
              },
            ],
            roles: ['manager'],
          },
        ],
        webDavUrl: 'test-web-dav-url',
      },
      webUrl: 'test-web-url',
    }
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should return the space data when the request is successful', async () => {
      const response: AxiosResponse<OcisSpace> = {
        data,
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        config: undefined,
      }
      mockedAxios.get.mockResolvedValueOnce(response)

      const space = await findSpaceById(id)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`${OcisLibreGraphRoute.DRIVES}/${id}`),
        expect.any(Object)
      )
      expect(space).toEqual(data)
    })

    it('should throw an error when the request fails', async () => {
      const response = {
        response: {
          status: 500,
        },
      }
      mockedAxios.get.mockRejectedValueOnce(response)

      await expect(findSpaceById(id)).rejects.toThrowError(`Failed to find an oCIS space with ID ${id}`)
    })
  })

  describe('disableSpaceById', () => {
    const id = 'test-space-id'

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should delete the space when the request is successful', async () => {
      const response: AxiosResponse = {
        data: undefined,
        status: 204,
        statusText: undefined,
        headers: undefined,
        config: undefined,
      }

      mockedAxios.delete.mockResolvedValueOnce(response)

      await disableSpaceById(id)

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`${OcisLibreGraphRoute.DRIVES}/${id}`),
        expect.any(Object)
      )
    })

    it('should throw an error when the request fails', async () => {
      const response = {
        response: {
          status: 500,
        },
      }

      mockedAxios.delete.mockRejectedValueOnce(response)

      await expect(disableSpaceById(id)).rejects.toThrowError(`Failed to disable oCIS space with ID ${id}`)
    })
  })

  describe('deleteSpaceById', () => {
    const id = 'test-space-id'

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should delete the space when the request is successful', async () => {
      const response: AxiosResponse = {
        data: undefined,
        status: 204,
        statusText: undefined,
        headers: { Purge: 'T' },
        config: undefined,
      }

      mockedAxios.delete.mockResolvedValueOnce(response)

      await deleteSpaceById(id)
      expect(mockedAxios.delete).toHaveBeenCalledTimes(2)
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`${OcisLibreGraphRoute.DRIVES}/${id}`),
        expect.any(Object)
      )
    })

    it('should throw an error when the request fails', async () => {
      const disableSpaceResponse: AxiosResponse = {
        data: undefined,
        status: 204,
        statusText: undefined,
        headers: undefined,
        config: undefined,
      }

      mockedAxios.delete.mockResolvedValueOnce(disableSpaceResponse)

      const deleteSpaceResponse = {
        response: {
          status: 500,
        },
      }

      mockedAxios.delete.mockRejectedValueOnce(deleteSpaceResponse)

      await expect(deleteSpaceById(id)).rejects.toThrowError(`Failed to delete oCIS space with ID ${id}`)
    })
  })

  describe('removeSpaceUser', () => {
    const spaceId = 'test-space-id'
    const username = 'test-user-username'

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should remove user from space', async () => {
      // Set up mock Axios response.
      const response = 'success'

      mockedAxios.delete.mockResolvedValueOnce(response)

      await removeSpaceUser(spaceId, username)

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`${OcisApi.SHARE_API_PATH}/${spaceId}?shareWith=${username}`),
        {
          auth: expect.any(Object),
          httpsAgent: expect.any(Object),
        }
      )
    })

    it('should throw an error if user removal from space fails', async () => {
      const error = new Error('User removal from space failed')
      mockedAxios.delete.mockRejectedValueOnce(error)

      await expect(removeSpaceUser(spaceId, username)).rejects.toThrowError(
        `Failed to remove user ${username} from oCIS space with ID ${spaceId}`
      )
    })
  })
})
