import { SpaceMappingRepository, UserMappingRepository } from '../../db'
import { logger } from '../../logger'
import {
  assignUserRole,
  createSpace,
  createUser,
  findSpaceById,
  findUserByAccountName,
  findUserById,
  updateUser,
} from '../../ocis-api'
import { OcisDefaultUUIDRole, OcisSpace, OcisUser, OcisUserType, UserPayload } from '../../types'
import {
  findOcisSpace,
  findOcisUser,
  findOrCreateOcisSpace,
  findOrCreateOcisUser,
  updateOrCreateOcisUser,
} from '../helpers'

jest.mock('../../db')
jest.mock('../../logger')
jest.mock('../../ocis-api')

describe('findOcisUser', () => {
  let user: UserPayload
  let ocisUser: OcisUser
  let userIdentity

  let userMappingRepositoryfindByUserIdMock: jest.MockedFunction<typeof UserMappingRepository.prototype.findByUserId>
  let userMappingRepositorycreateMock: jest.MockedFunction<typeof UserMappingRepository.prototype.create>

  let findUserByIdMock: jest.MockedFunction<typeof findUserById>
  let findUserByAccountNameMock: jest.MockedFunction<typeof findUserByAccountName>

  beforeEach(() => {
    user = {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'Test User',
    }
    ocisUser = {
      id: 'ocis-user-id',
      accountEnabled: true,
      displayName: 'Test User',
      givenName: '',
      mail: '',
      onPremisesSamAccountName: 'holi_user-id',
      surname: '',
      userType: OcisUserType.MEMBER,
    }
    userIdentity = { id: 1, user_id: user.id, ocis_user_id: ocisUser.id }
    userMappingRepositoryfindByUserIdMock = UserMappingRepository.prototype.findByUserId as jest.Mock
    userMappingRepositorycreateMock = UserMappingRepository.prototype.create as jest.Mock

    findUserByIdMock = findUserById as jest.MockedFunction<typeof findUserById>
    findUserByAccountNameMock = findUserByAccountName as jest.MockedFunction<typeof findUserByAccountName>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return an existing user by ID', async () => {
    userMappingRepositoryfindByUserIdMock.mockResolvedValueOnce(userIdentity)

    findUserByIdMock.mockResolvedValueOnce(ocisUser)

    const result = await findOcisUser(user)

    expect(result).toEqual(ocisUser)
    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(findUserByIdMock).toHaveBeenCalledWith(userIdentity.ocis_user_id)
    expect(findUserByAccountNameMock).not.toHaveBeenCalled()
    expect(userMappingRepositorycreateMock).not.toHaveBeenCalled()
  })

  it('should return an existing user by account name', async () => {
    findUserByAccountNameMock.mockResolvedValueOnce(ocisUser)

    const result = await findOcisUser(user)

    expect(result).toEqual(ocisUser)
    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(findUserByIdMock).not.toHaveBeenCalled()
    expect(findUserByAccountNameMock).toHaveBeenCalledWith(user.id)
  })

  it('should return undefined if user does not exist', async () => {
    userMappingRepositoryfindByUserIdMock.mockResolvedValueOnce(null)

    const result = await findOcisUser(user)

    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(result).toBeUndefined()
  })
})

describe('findOrCreateOcisUser', () => {
  let user: UserPayload
  let ocisUser: OcisUser
  let userIdentity

  let userMappingRepositoryfindByUserIdMock: jest.MockedFunction<typeof UserMappingRepository.prototype.findByUserId>
  let userMappingRepositorycreateMock: jest.MockedFunction<typeof UserMappingRepository.prototype.create>

  let findUserByIdMock: jest.MockedFunction<typeof findUserById>
  let findUserByAccountNameMock: jest.MockedFunction<typeof findUserByAccountName>
  let createUserMock: jest.MockedFunction<typeof createUser>
  let assignUserRoleMock: jest.MockedFunction<typeof assignUserRole>
  let loggerDebugMock: jest.MockedFunction<typeof logger.debug>

  beforeEach(() => {
    user = {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'Test User',
    }
    ocisUser = {
      id: 'ocis-user-id',
      accountEnabled: true,
      displayName: 'Test User',
      givenName: '',
      mail: '',
      onPremisesSamAccountName: 'holi_user-id',
      surname: '',
      userType: OcisUserType.MEMBER,
    }
    userIdentity = { id: 1, user_id: user.id, ocis_user_id: ocisUser.id }
    userMappingRepositoryfindByUserIdMock = UserMappingRepository.prototype.findByUserId as jest.Mock
    userMappingRepositorycreateMock = UserMappingRepository.prototype.create as jest.Mock

    findUserByIdMock = findUserById as jest.MockedFunction<typeof findUserById>
    findUserByAccountNameMock = findUserByAccountName as jest.MockedFunction<typeof findUserByAccountName>
    createUserMock = createUser as jest.MockedFunction<typeof createUser>
    assignUserRoleMock = assignUserRole as jest.MockedFunction<typeof assignUserRole>
    loggerDebugMock = logger.debug as jest.MockedFunction<typeof logger.debug>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return an existing user by ID', async () => {
    userMappingRepositoryfindByUserIdMock.mockResolvedValueOnce(userIdentity)

    findUserByIdMock.mockResolvedValueOnce(ocisUser)

    const result = await findOrCreateOcisUser(user)

    expect(result).toEqual(ocisUser)
    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(findUserByIdMock).toHaveBeenCalledWith(userIdentity.ocis_user_id)
    expect(findUserByAccountNameMock).not.toHaveBeenCalled()
    expect(createUserMock).not.toHaveBeenCalled()
    expect(assignUserRoleMock).not.toHaveBeenCalled()
    expect(userMappingRepositorycreateMock).not.toHaveBeenCalled()
  })

  it('should return an existing user by account name', async () => {
    findUserByAccountNameMock.mockResolvedValueOnce(ocisUser)

    const result = await findOrCreateOcisUser(user)

    expect(result).toEqual(ocisUser)
    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(findUserByIdMock).not.toHaveBeenCalled()
    expect(findUserByAccountNameMock).toHaveBeenCalledWith(user.id)
    expect(createUserMock).not.toHaveBeenCalled()
    expect(assignUserRoleMock).not.toHaveBeenCalled()
    expect(userMappingRepositorycreateMock).toHaveBeenCalled()
  })

  it('should create a new user if none is found', async () => {
    createUserMock.mockResolvedValueOnce(ocisUser)

    const result = await findOrCreateOcisUser(user)

    expect(result).toEqual(ocisUser)
    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(findUserByIdMock).not.toHaveBeenCalled()
    expect(findUserByAccountNameMock).toHaveBeenCalledWith(user.id)
    expect(createUserMock).toHaveBeenCalledWith(user)
    expect(assignUserRoleMock).toHaveBeenCalledWith(ocisUser.id, OcisDefaultUUIDRole.LIGHTWEIGHT_USER)
    expect(userMappingRepositorycreateMock).toHaveBeenCalledWith(user.id, ocisUser.id)
    expect(loggerDebugMock).toHaveBeenCalledWith('User created successfully', { ocisUser })
  })
})

describe('updateOrCreateOcisUser', () => {
  let user: UserPayload
  let ocisUser: OcisUser
  let userIdentity

  let userMappingRepositoryfindByUserIdMock: jest.MockedFunction<typeof UserMappingRepository.prototype.findByUserId>
  let userMappingRepositorycreateMock: jest.MockedFunction<typeof UserMappingRepository.prototype.create>
  let findUserByAccountNameMock: jest.MockedFunction<typeof findUserByAccountName>

  let createUserMock: jest.MockedFunction<typeof createUser>
  let assignUserRoleMock: jest.MockedFunction<typeof assignUserRole>
  let updateUserMock: jest.MockedFunction<typeof updateUser>
  let loggerDebugMock: jest.MockedFunction<typeof logger.debug>
  let loggerWarningMock: jest.MockedFunction<typeof logger.warn>

  beforeEach(() => {
    user = {
      id: 'user-id',
      email: 'user-email@example.com',
      name: 'Test User',
    }
    ocisUser = {
      id: 'ocis-user-id',
      accountEnabled: true,
      displayName: 'Test User',
      givenName: '',
      mail: '',
      onPremisesSamAccountName: 'holi_user-id',
      surname: '',
      userType: OcisUserType.MEMBER,
    }
    userIdentity = { id: 1, user_id: user.id, ocis_user_id: ocisUser.id }
    userMappingRepositoryfindByUserIdMock = UserMappingRepository.prototype.findByUserId as jest.Mock
    userMappingRepositorycreateMock = UserMappingRepository.prototype.create as jest.Mock
    findUserByAccountNameMock = findUserByAccountName as jest.MockedFunction<typeof findUserByAccountName>

    createUserMock = createUser as jest.MockedFunction<typeof createUser>
    assignUserRoleMock = assignUserRole as jest.MockedFunction<typeof assignUserRole>
    updateUserMock = updateUser as jest.MockedFunction<typeof updateUser>
    loggerDebugMock = logger.debug as jest.MockedFunction<typeof logger.debug>
    loggerWarningMock = logger.warn as jest.MockedFunction<typeof logger.warn>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should update an existing user if user identity record exist', async () => {
    userMappingRepositoryfindByUserIdMock.mockResolvedValueOnce(userIdentity)

    const ocisUser = await updateOrCreateOcisUser(user)

    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(findUserByAccountNameMock).not.toHaveBeenCalled()

    expect(updateUserMock).toHaveBeenCalledWith(userIdentity.ocis_user_id, user)

    expect(loggerDebugMock).toHaveBeenCalledWith('User name updated successfully', { ocisUser })

    expect(userMappingRepositorycreateMock).not.toHaveBeenCalled()
    expect(createUserMock).not.toHaveBeenCalled()
    expect(assignUserRoleMock).not.toHaveBeenCalled()
  })

  it('should update an existing user if user exists on oCIS', async () => {
    userMappingRepositoryfindByUserIdMock.mockResolvedValueOnce(null)
    findUserByAccountNameMock.mockResolvedValueOnce(ocisUser)

    const updatedOcisUser = await updateOrCreateOcisUser(user)

    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(updateUserMock).toHaveBeenCalledWith(userIdentity.ocis_user_id, user)

    expect(loggerDebugMock).toHaveBeenCalledWith('User name updated successfully', { ocisUser: updatedOcisUser })

    expect(userMappingRepositorycreateMock).not.toHaveBeenCalled()
    expect(createUserMock).not.toHaveBeenCalled()
    expect(assignUserRoleMock).not.toHaveBeenCalled()
  })

  it('should create a new user if none is found', async () => {
    userMappingRepositoryfindByUserIdMock.mockResolvedValueOnce(null)

    createUserMock.mockResolvedValueOnce(ocisUser)

    await updateOrCreateOcisUser(user)

    expect(userMappingRepositoryfindByUserIdMock).toHaveBeenCalledWith(user.id)
    expect(loggerWarningMock).toHaveBeenCalledWith(
      `User with ID ${user.id} was not found. A new user will be created.`,
      {
        user,
      }
    )
    expect(createUserMock).toHaveBeenCalledWith(user)
    expect(assignUserRoleMock).toHaveBeenCalledWith(ocisUser.id, OcisDefaultUUIDRole.LIGHTWEIGHT_USER)
    expect(userMappingRepositorycreateMock).toHaveBeenCalledWith(user.id, ocisUser.id)
    expect(loggerDebugMock).toHaveBeenCalledWith('User created successfully', { ocisUser })

    expect(updateUserMock).not.toHaveBeenCalledWith()
  })
})

describe('findOcisSpace', () => {
  const ocisSpace: OcisSpace = {
    id: 'ocis-space-id',
    driveAlias: '',
    driveType: '',
    lastModifiedDateTime: '',
    name: '',
    owner: {
      user: {
        displayName: '',
        id: '',
      },
    },
    quota: {
      remaining: 0,
      state: '',
      total: 0,
      used: 0,
    },
    root: {
      eTag: '',
      id: '',
      permissions: [
        {
          grantedTo: [
            {
              user: {
                id: 'ocis-user-id',
                displayName: 'OCIS user',
              },
            },
          ],
          roles: [],
        },
      ],
      webDavUrl: '',
    },
    webUrl: '',
  }
  const spacePayload = {
    id: 'space-id',
    name: 'Test Space',
    slug: 'test-space',
  }
  const spaceMapping = { id: 1, space_id: spacePayload.id, ocis_space_id: ocisSpace.id }
  let spaceMappingFindBySpaceIdMock: jest.MockedFunction<typeof SpaceMappingRepository.prototype.findBySpaceId>
  let findSpaceByIdMock = findSpaceById as jest.MockedFunction<typeof findSpaceById>

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    spaceMappingFindBySpaceIdMock = SpaceMappingRepository.prototype.findBySpaceId as jest.Mock
  })

  it('should return an existing space by ID', async () => {
    spaceMappingFindBySpaceIdMock.mockResolvedValueOnce(spaceMapping)
    findSpaceByIdMock.mockResolvedValueOnce(ocisSpace)

    const result = await findOcisSpace(spacePayload)

    expect(result).toEqual(ocisSpace)
    expect(spaceMappingFindBySpaceIdMock).toHaveBeenCalledWith(spacePayload.id)
    expect(findSpaceByIdMock).toHaveBeenCalledWith(ocisSpace.id)
  })

  it('should return undefined if space does not exist', async () => {
    spaceMappingFindBySpaceIdMock.mockResolvedValueOnce(null)

    const result = await findOcisSpace(spacePayload)

    expect(spaceMappingFindBySpaceIdMock).toHaveBeenCalledWith(spacePayload.id)
    expect(findSpaceByIdMock).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})

describe('findOrCreateOcisSpace', () => {
  const ocisSpace: OcisSpace = {
    id: 'ocis-space-id',
    driveAlias: '',
    driveType: '',
    lastModifiedDateTime: '',
    name: '',
    owner: {
      user: {
        displayName: '',
        id: '',
      },
    },
    quota: {
      remaining: 0,
      state: '',
      total: 0,
      used: 0,
    },
    root: {
      eTag: '',
      id: '',
      permissions: [
        {
          grantedTo: [
            {
              user: {
                id: 'ocis-user-id',
                displayName: 'OCIS user',
              },
            },
          ],
          roles: [],
        },
      ],
      webDavUrl: '',
    },
    webUrl: '',
  }
  const spacePayload = {
    id: 'space-id',
    name: 'Test Space',
    slug: 'test-space',
  }
  const spaceMapping = { id: 1, space_id: spacePayload.id, ocis_space_id: ocisSpace.id }
  let spaceMappingFindBySpaceIdMock: jest.MockedFunction<typeof SpaceMappingRepository.prototype.findBySpaceId>
  let spaceMappingCreateMock: jest.MockedFunction<typeof SpaceMappingRepository.prototype.create>
  let findSpaceByIdMock = findSpaceById as jest.MockedFunction<typeof findSpaceById>
  let createSpaceMock = createSpace as jest.MockedFunction<typeof createSpace>
  const loggerDebugMock = logger.debug as jest.MockedFunction<typeof logger.debug>

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    spaceMappingFindBySpaceIdMock = SpaceMappingRepository.prototype.findBySpaceId as jest.Mock
    spaceMappingCreateMock = SpaceMappingRepository.prototype.create as jest.Mock
  })

  it('should return an existing space by ID', async () => {
    spaceMappingFindBySpaceIdMock.mockResolvedValueOnce(spaceMapping)
    findSpaceByIdMock.mockResolvedValueOnce(ocisSpace)

    const result = await findOrCreateOcisSpace(spacePayload)

    expect(result).toEqual(ocisSpace)
    expect(spaceMappingFindBySpaceIdMock).toHaveBeenCalledWith(spacePayload.id)
    expect(findSpaceByIdMock).toHaveBeenCalledWith(ocisSpace.id)
    expect(createSpaceMock).not.toHaveBeenCalled()
    expect(spaceMappingCreateMock).not.toHaveBeenCalled()
  })

  it('should create a new space if none is found', async () => {
    createSpaceMock.mockResolvedValueOnce(ocisSpace)

    const result = await findOrCreateOcisSpace(spacePayload)

    expect(result).toEqual(ocisSpace)
    expect(spaceMappingFindBySpaceIdMock).toHaveBeenCalledWith(spacePayload.id)
    expect(findSpaceByIdMock).not.toHaveBeenCalled()
    expect(createSpaceMock).toHaveBeenCalledWith(spacePayload)
    expect(spaceMappingCreateMock).toHaveBeenCalledWith(spacePayload.id, ocisSpace.id)
    expect(loggerDebugMock).toHaveBeenCalledWith('Space created successfully', { ocisSpace })
  })
})
