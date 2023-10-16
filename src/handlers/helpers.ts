import { SpaceMappingRepository, UserMappingRepository } from '../db'
import { logger } from '../logger'
import {
  assignUserRole,
  createSpace,
  createUser,
  findSpaceById,
  findUserByAccountName,
  findUserById,
  updateUser,
} from '../ocis-api'
import { OcisDefaultUUIDRole, OcisSpace, OcisUser, SpacePayload, UserPayload } from '../types'

//Finds an existing OCIS user either by ID or by account name.
export const findOcisUser = async (user: UserPayload): Promise<OcisUser> => {
  const userMappingRepository = new UserMappingRepository()
  const userIdentity = await userMappingRepository.findByUserId(user.id)

  if (!userIdentity) {
    return findUserByAccountName(user.id)
  }

  return await findUserById(userIdentity.ocis_user_id)
}

//Finds an existing OCIS user (i.e. either by ID or by account name) or creates a new one based on the given user payload.
export const findOrCreateOcisUser = async (user: UserPayload): Promise<OcisUser> => {
  const userMappingRepository = new UserMappingRepository()
  const userIdentity = await userMappingRepository.findByUserId(user.id)

  if (userIdentity) {
    return await findUserById(userIdentity.ocis_user_id)
  }

  let ocisUser = await findUserByAccountName(user.id)

  if (!ocisUser) {
    ocisUser = await createUser(user)
    await assignUserRole(ocisUser.id, OcisDefaultUUIDRole.LIGHTWEIGHT_USER)
  }

  await userMappingRepository.create(user.id, ocisUser.id)
  logger.debug('User created successfully', { ocisUser })

  return ocisUser
}

// Updates an existing OCIS user or creates a new one based on the given user payload.
export const updateOrCreateOcisUser = async (user: UserPayload): Promise<OcisUser> => {
  const userMappingRepository = new UserMappingRepository()
  const userIdentity = await userMappingRepository.findByUserId(user.id)

  if (userIdentity) {
    // If a user mapping record exists, update the corresponding oCIS user with the new user name.
    const updatedOcisUser = await updateUser(userIdentity.ocis_user_id, user)
    logger.debug('User name updated successfully', { ocisUser: updatedOcisUser })
    return updatedOcisUser
  } else {
    // If a user mapping record does not exist, look up the oCIS user by account name.
    const ocisUser = await findUserByAccountName(user.id)
    if (ocisUser) {
      // If an oCIS user with the same account name exists, update it with the new user name.
      const updatedOcisUser = await updateUser(ocisUser.id, user)
      logger.debug('User name updated successfully', { ocisUser: updatedOcisUser })
      return updatedOcisUser
    }

    // Warning: Do not remove the following log statement as it is useful for debugging and troubleshooting in case of unexpected issues in the future.
    // This log message helps to identify when a new user is being created because the corresponding user identity record could not be found.
    // Removing this log statement could make it difficult to trace the root cause of certain issues.
    logger.warn(`User with ID ${user.id} was not found. A new user will be created.`, {
      user,
    })
    // If neither a user mapping record nor an oCIS user with the same account name exists, create a new OCIS user.
    const newOcisUser = await createUser(user)
    await assignUserRole(newOcisUser.id, OcisDefaultUUIDRole.LIGHTWEIGHT_USER)
    await userMappingRepository.create(user.id, newOcisUser.id)
    logger.debug('User created successfully', { ocisUser: newOcisUser })
    return newOcisUser
  }
}

// Finds an oCIS space
export const findOcisSpace = async (space: SpacePayload): Promise<OcisSpace> => {
  const spaceMappingRepository = new SpaceMappingRepository()
  const spaceMapping = await spaceMappingRepository.findBySpaceId(space.id)
  if (!spaceMapping) {
    return
  }
  return findSpaceById(spaceMapping.ocis_space_id)
}

// Finds an existing OCIS space or creates a new one incl. mapping with the given space payload.
export const findOrCreateOcisSpace = async (space: SpacePayload): Promise<OcisSpace> => {
  const spaceMappingRepository = new SpaceMappingRepository()
  const spaceMapping = await spaceMappingRepository.findBySpaceId(space.id)

  if (spaceMapping) {
    return findSpaceById(spaceMapping.ocis_space_id)
  }

  const ocisSpace = await createSpace(space)
  await spaceMappingRepository.create(space.id, ocisSpace.id)
  logger.debug('Space created successfully', { ocisSpace })

  return ocisSpace
}
