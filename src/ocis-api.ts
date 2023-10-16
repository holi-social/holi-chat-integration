import axios, { AxiosResponse, AxiosBasicCredentials, AxiosInstance } from 'axios'
import { Agent } from 'https'
import { ENVIRONMENT, OWNCLOUD_BASE_URL, OCIS_ADMIN_USERNAME, OCIS_ADMIN_PASSWORD, OCIS_OIDC_ISSUER } from './config'
import { HOLI_PREFIX, HOLI_EMAIL_DOMAIN, MAX_SPACE_QUOTA } from './constants'
import {
  OcisApi,
  OcisSpace,
  OcisUser,
  OcisRole,
  OcisLibreGraphRoute,
  OcisShareType,
  SpacePayload,
  UserPayload,
  OcisUserType,
} from './types'
import { logger } from './logger'
import { sanitizeSpaceName } from './utils'

export const client: AxiosInstance = axios.create({
  timeout: 30 * 1000,
})

// Whether to reject unauthorized TLS certificates. Set to false in a local development environment.
const httpsAgent = new Agent({
  rejectUnauthorized: ENVIRONMENT === 'local' ? false : true,
})

// Axios basic authentication credentials.
const auth: AxiosBasicCredentials = {
  username: OCIS_ADMIN_USERNAME,
  password: OCIS_ADMIN_PASSWORD,
}

/**
 * Finds an OcisUser by ID.
 * @async
 * @function
 * @param {string} id - The ID of the user to find.
 * @returns {Promise<OcisUser>} A Promise that resolves to the OcisUser found.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const findUserById = async (id: string): Promise<OcisUser> => {
  // Construct the URL to retrieve the user.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.USERS}/${id}`

  try {
    // Send a GET request to retrieve the user.
    const { data }: AxiosResponse<OcisUser> = await client.get(url, {
      auth: {
        username: OCIS_ADMIN_USERNAME,
        password: OCIS_ADMIN_PASSWORD,
      },
      httpsAgent,
    })
    return data
  } catch (error) {
    // Handle errors that occur during the request.
    const { response } = error
    if (response && response.status === 404) {
      return
    }
    logger.error({ error })
    throw new Error(`Failed to find an oCIS user with ID ${id}`)
  }
}

/**
 * Finds an OcisUser by account name.
 * @async
 * @function
 * @param {string} id - The ID of the user to find.
 * @returns {Promise<OcisUser>} A Promise that resolves to the OcisUser found.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const findUserByAccountName = async (id: string): Promise<OcisUser> => {
  // Construct the URL to retrieve the user.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.USERS}/${HOLI_PREFIX}_${id}`

  try {
    // Send a GET request to retrieve the user.
    const { data }: AxiosResponse<OcisUser> = await client.get(url, {
      auth: {
        username: OCIS_ADMIN_USERNAME,
        password: OCIS_ADMIN_PASSWORD,
      },
      httpsAgent,
    })
    return data
  } catch (error) {
    // Handle errors that occur during the request.
    const { response } = error
    if (response && response.status === 404) {
      return
    }
    logger.error({ error })
    throw new Error(`Failed to find an oCIS user with account name ${HOLI_PREFIX}_${id}`)
  }
}

/**
 * Creates a new OcisUser.
 * @async
 * @function
 * @param {UserPayload} user - The payload representing the user to be created.
 * @returns {Promise<OcisUser>} A Promise that resolves to the newly created OcisUser.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const createUser = async (user: UserPayload): Promise<OcisUser> => {
  // Construct the URL to create the user.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.USERS}`

  try {
    // Send a POST request to create the user.
    const { data }: AxiosResponse<OcisUser> = await client.post(
      url,
      {
        mail: `${user.id}@${HOLI_EMAIL_DOMAIN}`,
        displayName: user.name ? user.name : `${HOLI_PREFIX}_${user.id}`,
        onPremisesSamAccountName: `${HOLI_PREFIX}_${user.id}`,
        userType: OcisUserType.MEMBER,
        identities: [
          {
            issuer: OCIS_OIDC_ISSUER,
            issuerAssignedId: user.id,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth,
        httpsAgent,
      }
    )
    return data
  } catch (error) {
    // Handle errors that occur during the request.
    logger.error({ error })
    throw new Error(`Failed to create an oCIS account for user with ID ${user.id}`)
  }
}

/**
 * Updates an existing OcisUser.
 * @async
 * @function
 * @param {UserPayload} user - The payload representing the user to be updated.
 * @returns {Promise<OcisUser>} A Promise that resolves to the updated OcisUser.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const updateUser = async (id: string, user: UserPayload): Promise<OcisUser> => {
  // Construct the URL to update the user.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.USERS}/${id}`

  try {
    // Send a PATCH request to update the user.
    const { data }: AxiosResponse<OcisUser> = await client.patch(
      url,
      {
        displayName: user.name,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth,
        httpsAgent,
      }
    )
    return data
  } catch (error) {
    // Handle errors that occur during the request.
    logger.error({ error })
    throw new Error(`Failed to update oCIS account for user with ID ${user.id}`)
  }
}

/**
 * Assigns a role to an OcisUser.
 * @async
 * @function
 * @param {string} userId - The ID of the user to assign the role to.
 * @param {string} roleId - The ID of the role to assign to the user.
 * @returns {Promise<void>} A Promise that resolves when the role is successfully assigned.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const assignUserRole = async (userId: string, roleId: string): Promise<void> => {
  // Construct the URL to assign the role.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.SETTINGS_API_PATH}/assignments-add`

  try {
    // Send a POST request to assign the role.
    await client.post(
      url,
      {
        account_uuid: userId,
        role_id: roleId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth,
        httpsAgent,
      }
    )
  } catch (error) {
    // Handle errors that occur during the request.
    logger.error({ error })
    throw new Error(`Failed to assign role ${roleId} to user ${userId}`)
  }
}

/**
 * Deletes an oCIS user.
 * @async
 * @function
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<void>} A Promise that resolves when the user is successfully deleted.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const deleteUserById = async (id: string): Promise<void> => {
  // Construct the URL to delete the user.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.USERS}/${id}`

  try {
    // Send a DELETE request to remove the user.
    await client.delete(url, {
      auth,
      httpsAgent,
    })
  } catch (error) {
    // Handle errors that occur during the request.
    logger.error({ error })
    throw new Error(`Failed to delete user with ID ${id}`)
  }
}

/**
 * Creates a new OcisSpace.
 * @async
 * @function
 * @param {SpacePayload} space - An object containing the properties of the new space to create.
 * @returns {Promise<OcisSpace>} A Promise that resolves with the newly created space object.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const createSpace = async (space: SpacePayload): Promise<OcisSpace> => {
  // Construct the URL to create the space.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.DRIVES}`

  try {
    // Send a POST request to create the space.
    const { data }: AxiosResponse<OcisSpace> = await client.post(
      url,
      {
        name: sanitizeSpaceName(space.name),
        driveAlias: space.slug,
        quota: {
          total: MAX_SPACE_QUOTA,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        auth,
        httpsAgent,
      }
    )
    return data
  } catch (error) {
    // Handle errors that occur during the request.
    logger.error({ error })
    throw new Error(`Failed to create an oCIS drive for space ${space.id}`)
  }
}

/**
 * Shares an OcisSpace with a user by adding a share entry to the space's sharing settings.
 * @async
 * @function
 * @param {string} spaceId - The UUID of the space to share.
 * @param {string} username - The username of the user to share the space with.
 * @param {Role} role - The role to assign to the user for the shared space.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const shareSpaceWithUser = async (spaceId: string, username: string, role: OcisRole): Promise<void> => {
  // Construct the URL to share the space with the user.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.SHARE_API_PATH}`

  try {
    // Send a POST request to share the space with the user.
    await client.post(
      url,
      `space_ref=${spaceId}&shareType=${OcisShareType.SHARE_SPACE}&shareWith=${username}&role=${role}`,
      {
        auth,
        httpsAgent,
      }
    )
  } catch (error) {
    // Handle errors that occur during the request.
    logger.error({ error })
    throw new Error(`Failed to share the oCIS space ${spaceId} with user ${username}`)
  }
}

/**
 * Finds an OcisSpace by ID.
 * @async
 * @function
 * @param {string} id - The ID of the space to find.
 * @returns {Promise<OcisSpace>} A Promise that resolves to the OcisSpace found.
 * @throws {Error} Throws an error if the request fails.
 */
export const findSpaceById = async (id: string): Promise<OcisSpace> => {
  // Construct the URL to retrieve the space.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.DRIVES}/${id}`

  try {
    // Send a GET request to retrieve the space.
    const { data }: AxiosResponse<OcisSpace> = await client.get(url, {
      auth: {
        username: OCIS_ADMIN_USERNAME,
        password: OCIS_ADMIN_PASSWORD,
      },
      httpsAgent,
    })
    return data
  } catch (error) {
    // Handle errors that occur during the request.
    const { response } = error
    if (response && response.status === 404) {
      return
    }
    logger.error({ error })
    throw new Error(`Failed to find an oCIS space with ID ${id}`)
  }
}
/**
 * Makes the space content unavailable for all space members. No data will be deleted
 * @async
 * @function
 * @param {string} id - The ID of the space to delete.
 * @throws {Error} Throws an error if the request fails.
 */
export const disableSpaceById = async (id: string): Promise<void> => {
  // Construct the URL to disable the space.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.DRIVES}/${id}`

  try {
    // Send a DELETE request to disable the space.
    await client.delete(url, {
      auth: {
        username: OCIS_ADMIN_USERNAME,
        password: OCIS_ADMIN_PASSWORD,
      },
      httpsAgent,
    })
  } catch (error) {
    logger.error({ error })
    throw new Error(`Failed to disable oCIS space with ID ${id}`)
  }
}

/**
 * Permanently deletes an OcisSpace by ID. This is restricted to spaces that are already disabled.
 * @async
 * @function
 * @param {string} id - The ID of the space to delete.
 * @throws {Error} Throws an error if the request fails.
 */
export const deleteSpaceById = async (id: string): Promise<void> => {
  // Construct the URL to delete the space permanently.
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.LIBRE_GRAPH_API_PATH}/${OcisLibreGraphRoute.DRIVES}/${id}`

  // disable the space
  await disableSpaceById(id)

  try {
    // Send a DELETE request to remove the space.
    await client.delete(url, {
      headers: {
        Purge: 'T',
      },
      auth: {
        username: OCIS_ADMIN_USERNAME,
        password: OCIS_ADMIN_PASSWORD,
      },
      httpsAgent,
    })
  } catch (error) {
    logger.error({ error })
    throw new Error(`Failed to delete oCIS space with ID ${id}`)
  }
}

/**
 * Removes a user from a space
 * @async
 * @function
 * @param {string} spaceId - The UUID of the space.
 * @param {string} username - The username of the user to remove from the space.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const removeSpaceUser = async (spaceId: string, username: string): Promise<void> => {
  // Construct the URL to remove the user from the space
  const url = `${OWNCLOUD_BASE_URL}/${OcisApi.SHARE_API_PATH}/${spaceId}?shareWith=${username}`

  try {
    // Send a DELETE request to remove the user from the space.
    await client.delete(url, {
      auth,
      httpsAgent,
    })
  } catch (error) {
    // Handle errors that occur during the request.
    logger.error({ error })
    throw new Error(`Failed to remove user ${username} from oCIS space with ID ${spaceId}`)
  }
}
