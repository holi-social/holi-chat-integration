import axios, { AxiosResponse, AxiosBasicCredentials, AxiosInstance } from 'axios'
import { Agent } from 'https'
import { ENVIRONMENT, OWNCLOUD_BASE_URL, CHAT_ADMIN_USERNAME, CHAT_ADMIN_PASSWORD, CHAT_OIDC_ISSUER } from './config'
import { HOLI_PREFIX, HOLI_EMAIL_DOMAIN, MAX_SPACE_QUOTA } from './constants'
import {
  ChatApi,
  ChatSpace,
  ChatUser,
  ChatRole,
  ChatLibreGraphRoute,
  ChatShareType,
  SpacePayload,
  UserPayload,
  ChatUserType,
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
  username: CHAT_ADMIN_USERNAME,
  password: CHAT_ADMIN_PASSWORD,
}

/**
 * Finds an ChatUser by ID.
 * @async
 * @function
 * @param {string} id - The ID of the user to find.
 * @returns {Promise<ChatUser>} A Promise that resolves to the ChatUser found.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const findUserById = async (id: string): Promise<ChatUser> => {
  // Construct the URL to retrieve the user.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.LIBRE_GRAPH_API_PATH}/${ChatLibreGraphRoute.USERS}/${id}`

  try {
    // Send a GET request to retrieve the user.
    const { data }: AxiosResponse<ChatUser> = await client.get(url, {
      auth: {
        username: CHAT_ADMIN_USERNAME,
        password: CHAT_ADMIN_PASSWORD,
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
    throw new Error(`Failed to find an chat user with ID ${id}`)
  }
}

/**
 * Finds an ChatUser by account name.
 * @async
 * @function
 * @param {string} id - The ID of the user to find.
 * @returns {Promise<ChatUser>} A Promise that resolves to the ChatUser found.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const findUserByAccountName = async (id: string): Promise<ChatUser> => {
  // Construct the URL to retrieve the user.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.LIBRE_GRAPH_API_PATH}/${ChatLibreGraphRoute.USERS}/${HOLI_PREFIX}_${id}`

  try {
    // Send a GET request to retrieve the user.
    const { data }: AxiosResponse<ChatUser> = await client.get(url, {
      auth: {
        username: CHAT_ADMIN_USERNAME,
        password: CHAT_ADMIN_PASSWORD,
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
    throw new Error(`Failed to find an chat user with account name ${HOLI_PREFIX}_${id}`)
  }
}

/**
 * Creates a new ChatUser.
 * @async
 * @function
 * @param {UserPayload} user - The payload representing the user to be created.
 * @returns {Promise<ChatUser>} A Promise that resolves to the newly created ChatUser.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const createUser = async (user: UserPayload): Promise<ChatUser> => {
  // Construct the URL to create the user.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.LIBRE_GRAPH_API_PATH}/${ChatLibreGraphRoute.USERS}`

  try {
    // Send a POST request to create the user.
    const { data }: AxiosResponse<ChatUser> = await client.post(
      url,
      {
        mail: `${user.id}@${HOLI_EMAIL_DOMAIN}`,
        displayName: user.name ? user.name : `${HOLI_PREFIX}_${user.id}`,
        onPremisesSamAccountName: `${HOLI_PREFIX}_${user.id}`,
        userType: ChatUserType.MEMBER,
        identities: [
          {
            issuer: CHAT_OIDC_ISSUER,
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
    throw new Error(`Failed to create an chat account for user with ID ${user.id}`)
  }
}

/**
 * Updates an existing ChatUser.
 * @async
 * @function
 * @param {UserPayload} user - The payload representing the user to be updated.
 * @returns {Promise<ChatUser>} A Promise that resolves to the updated ChatUser.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const updateUser = async (id: string, user: UserPayload): Promise<ChatUser> => {
  // Construct the URL to update the user.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.LIBRE_GRAPH_API_PATH}/${ChatLibreGraphRoute.USERS}/${id}`

  try {
    // Send a PATCH request to update the user.
    const { data }: AxiosResponse<ChatUser> = await client.patch(
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
    throw new Error(`Failed to update chat account for user with ID ${user.id}`)
  }
}

/**
 * Assigns a role to an ChatUser.
 * @async
 * @function
 * @param {string} userId - The ID of the user to assign the role to.
 * @param {string} roleId - The ID of the role to assign to the user.
 * @returns {Promise<void>} A Promise that resolves when the role is successfully assigned.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const assignUserRole = async (userId: string, roleId: string): Promise<void> => {
  // Construct the URL to assign the role.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.SETTINGS_API_PATH}/assignments-add`

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
 * Deletes an chat user.
 * @async
 * @function
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<void>} A Promise that resolves when the user is successfully deleted.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const deleteUserById = async (id: string): Promise<void> => {
  // Construct the URL to delete the user.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.LIBRE_GRAPH_API_PATH}/${ChatLibreGraphRoute.USERS}/${id}`

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
 * Creates a new ChatSpace.
 * @async
 * @function
 * @param {SpacePayload} space - An object containing the properties of the new space to create.
 * @returns {Promise<ChatSpace>} A Promise that resolves with the newly created space object.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const createSpace = async (space: SpacePayload): Promise<ChatSpace> => {
  // Construct the URL to create the space.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.LIBRE_GRAPH_API_PATH}/${ChatLibreGraphRoute.DRIVES}`

  try {
    // Send a POST request to create the space.
    const { data }: AxiosResponse<ChatSpace> = await client.post(
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
    throw new Error(`Failed to create an chat drive for space ${space.id}`)
  }
}

/**
 * Shares an ChatSpace with a user by adding a share entry to the space's sharing settings.
 * @async
 * @function
 * @param {string} spaceId - The UUID of the space to share.
 * @param {string} username - The username of the user to share the space with.
 * @param {Role} role - The role to assign to the user for the shared space.
 * @throws {Error} Throws an error if the request fails or if an unexpected response is received.
 */
export const shareSpaceWithUser = async (spaceId: string, username: string, role: ChatRole): Promise<void> => {
  // Construct the URL to share the space with the user.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.SHARE_API_PATH}`

  try {
    // Send a POST request to share the space with the user.
    await client.post(
      url,
      `space_ref=${spaceId}&shareType=${ChatShareType.SHARE_SPACE}&shareWith=${username}&role=${role}`,
      {
        auth,
        httpsAgent,
      }
    )
  } catch (error) {
    // Handle errors that occur during the request.
    logger.error({ error })
    throw new Error(`Failed to share the chat space ${spaceId} with user ${username}`)
  }
}

/**
 * Finds an ChatSpace by ID.
 * @async
 * @function
 * @param {string} id - The ID of the space to find.
 * @returns {Promise<ChatSpace>} A Promise that resolves to the ChatSpace found.
 * @throws {Error} Throws an error if the request fails.
 */
export const findSpaceById = async (id: string): Promise<ChatSpace> => {
  // Construct the URL to retrieve the space.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.LIBRE_GRAPH_API_PATH}/${ChatLibreGraphRoute.DRIVES}/${id}`

  try {
    // Send a GET request to retrieve the space.
    const { data }: AxiosResponse<ChatSpace> = await client.get(url, {
      auth: {
        username: CHAT_ADMIN_USERNAME,
        password: CHAT_ADMIN_PASSWORD,
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
    throw new Error(`Failed to find an chat space with ID ${id}`)
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
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.LIBRE_GRAPH_API_PATH}/${ChatLibreGraphRoute.DRIVES}/${id}`

  try {
    // Send a DELETE request to disable the space.
    await client.delete(url, {
      auth: {
        username: CHAT_ADMIN_USERNAME,
        password: CHAT_ADMIN_PASSWORD,
      },
      httpsAgent,
    })
  } catch (error) {
    logger.error({ error })
    throw new Error(`Failed to disable chat space with ID ${id}`)
  }
}

/**
 * Permanently deletes an ChatSpace by ID. This is restricted to spaces that are already disabled.
 * @async
 * @function
 * @param {string} id - The ID of the space to delete.
 * @throws {Error} Throws an error if the request fails.
 */
export const deleteSpaceById = async (id: string): Promise<void> => {
  // Construct the URL to delete the space permanently.
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.LIBRE_GRAPH_API_PATH}/${ChatLibreGraphRoute.DRIVES}/${id}`

  // disable the space
  await disableSpaceById(id)

  try {
    // Send a DELETE request to remove the space.
    await client.delete(url, {
      headers: {
        Purge: 'T',
      },
      auth: {
        username: CHAT_ADMIN_USERNAME,
        password: CHAT_ADMIN_PASSWORD,
      },
      httpsAgent,
    })
  } catch (error) {
    logger.error({ error })
    throw new Error(`Failed to delete chat space with ID ${id}`)
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
  const url = `${OWNCLOUD_BASE_URL}/${ChatApi.SHARE_API_PATH}/${spaceId}?shareWith=${username}`

  try {
    // Send a DELETE request to remove the user from the space.
    await client.delete(url, {
      auth,
      httpsAgent,
    })
  } catch (error) {
    // Handle errors that occur during the request.
    logger.error({ error })
    throw new Error(`Failed to remove user ${username} from chat space with ID ${spaceId}`)
  }
}
