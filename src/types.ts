/**
 * An enum that represents the type of event that can be triggered in the system.
 *
 * @enum {string}
 * @readonly
 */
export enum EventType {
  SPACE_CREATED = 'SpaceCreated',
  SPACE_UPDATED = 'SpaceUpdated',
  SPACE_USER_ADDED = 'SpaceUserAdded',
  USER_NAME_UPDATED = 'UserNameUpdated',
  SPACE_DELETED = 'SpaceDeleted',
  USER_DELETED = 'UserDeleted',
  SPACE_USER_LEFT = 'SpaceUserLeft',
  SPACE_USER_REMOVED = 'SpaceUserRemoved',
}

/**
 * Payload for a user
 *
 * @typedef {Object} UserPayload
 * @property {string} id - The unique identifier of the user
 * @property {string} email - The email address of the user
 * @property {string} name - The name of the user
 */
export type UserPayload = {
  id: string
  email: string
  name: string
  identity: string
}

/**
 * Payload for a space
 *
 * @typedef {Object} SpacePayload
 * @property {string} id - The unique identifier of the space
 * @property {string} name - The name of the space
 * @property {string} slug - The slug of the space
 * @property {string} description - The description of the space
 */
export type SpacePayload = {
  id: string
  name: string
  slug: string
  avatar?: string
  avatarDefaultColor: string
}

/**
 * Payload for data created when a space is created
 *
 * @typedef {Object} SpaceCreatedDataPayload
 * @property {UserPayload} creator - The user who created the space
 * @property {SpacePayload} space - The created space
 */
export type SpaceCreatedDataPayload = {
  creator: UserPayload
  space: SpacePayload
}

/**
 * Payload for data created when a space is updated
 *
 * @typedef {Object} SpaceCreatedDataPayload
 * @property {UserPayload} creator - The user who created the space
 * @property {SpacePayload} space - The updated space
 */
export type SpaceUpdatedDataPayload = {
  creator: UserPayload
  space: SpacePayload
}

/**
 * Payload for data created when a user is added to a space
 *
 * @typedef {Object} SpaceCreatedDataPayload
 * @property {UserPayload} user - The user who has been added to the space
 * @property {SpacePayload} space - The created space
 */
export type SpaceUserAddedDataPayload = {
  user: UserPayload
  space: SpacePayload
}

/**
 * Payload for data created when a user name is updated
 *
 * @typedef {Object} UserNameUpdatedDataPayload
 * @property {UserPayload} user - The user with a name that has been updated
 */
export type UserNameUpdatedDataPayload = {
  user: UserPayload
}

/**
 * Payload for data created when a space is deleted
 *
 * @typedef {Object} SpaceDeletedDataPayload
 * @property {SpacePayload} space - The space that has been deleted
 */
export type SpaceDeletedDataPayload = {
  space: SpacePayload
}

/**
 * Payload for data created when a user is deleted
 *
 * @typedef {Object} UserDeletedDataPayload
 * @property {UserPayload} user - The user that has been deleted
 */
export type UserDeletedDataPayload = {
  user: UserPayload
}

/**
 * Payload for data created when a user leaves a space
 *
 * @typedef {Object} SpaceUserLeftDataPayload
 * @property {UserPayload} user - The user that left the space
 * @property {SpacePayload} space - The space that has been left
 */
export type SpaceUserLeftDataPayload = {
  user: UserPayload
  space: SpacePayload
}

/**
 * Payload for data created when a user is removed from a space
 *
 * @typedef {Object} SpaceUserRemovedDataPayload
 * @property {UserPayload} user - The user that has been removed from the space
 * @property {SpacePayload} space - The space that the user has been removed from
 */
export type SpaceUserRemovedDataPayload = {
  user: UserPayload
  space: SpacePayload
}

/**
 * Enumeration of Chat API paths
 *
 * @readonly
 * @enum {string}
 * @property {string} LIBRE_GRAPH_API_PATH - Path for the Libre Graph API
 * @property {string} SHARE_API_PATH - Path for the Share API
 * @property {string} SETTINGS_API_PATH - Path for the Settings API
 */
export enum ChatApi {
  LIBRE_GRAPH_API_PATH = 'graph/v1.0',
  SHARE_API_PATH = 'ocs/v2.php/apps/files_sharing/api/v1/shares',
  SETTINGS_API_PATH = 'api/v0/settings',
}

/**
 * Enumeration of the Libre Graph routes
 *
 * @readonly
 * @enum {string}
 * @property {string} USERS - The users route
 * @property {string} DRIVES - The drives route
 * @property {string} GROUPS - The groups route
 * @property {string} MEMBERS - The members route
 */
export enum ChatLibreGraphRoute {
  USERS = 'users',
  DRIVES = 'drives',
  GROUPS = 'groups',
  MEMBERS = 'members',
}

/**
 * Enumeration of Chat user types
 *
 * @readonly
 * @enum {string}
 * @property {string} MEMBER - The member user type
 * @property {string} GUEST - The guest user type
 */
export enum ChatUserType {
  MEMBER = 'Member',
  GUEST = 'Guest',
}

/**
 * Enumeration of default UUID roles in Chat.
 *
 * @readonly
 * @enum {string}
 * @property {string} LIGHTWEIGHT_USER - The UUID for the Lightweight User role (i.e. a user without a personal space).
 */
export enum ChatDefaultUUIDRole {
  LIGHTWEIGHT_USER = '38071a68-456a-4553-846a-fa67bf5596cc',
}

/**
 * Enumeration of Chat roles
 *
 * @readonly
 * @enum {string}
 * @property {string} VIEWER - The viewer role
 * @property {string} EDITOR - The editor role
 * @property {string} MANAGER - The manager role
 */
export enum ChatRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  MANAGER = 'manager',
}

/**
 * Enumeration of Chat share types
 *
 * @readonly
 * @enum {number}
 * @property {number} SHARE_SPACE - The share space type
 */
export enum ChatShareType {
  SHARE_SPACE = 7,
}

/**
 * Represents a user in the Chat system.
 *
 * @typedef {Object} ChatUser
 * @property {string} id - The unique identifier of the user.
 * @property {boolean} accountEnabled - Whether the user's account is enabled.
 * @property {string} displayName - The display name of the user.
 * @property {string} givenName - The given name of the user.
 * @property {string} mail - The email address of the user.
 * @property {string} onPremisesSamAccountName - The SAM account name of the user.
 * @property {string} surname - The surname of the user.
 * @property {string} userType - The type of user.
 */
export type ChatUser = {
  id: string
  accountEnabled: boolean
  displayName: string
  givenName: string
  mail: string
  onPremisesSamAccountName: string
  surname: string
  userType: string
}

/**
 * Represents the root folder of a space in Chat.
 *
 * @typedef {Object} ChatSpaceRoot
 * @property {string} eTag - The ETag of the root folder.
 * @property {string} id - The unique identifier of the root folder.
 * @property {Object[]} permissions - The permissions for the root folder.
 * @property {Object[]} permissions.grantedTo - The identities granted permission to the root folder.
 * @property {Object} permissions.grantedTo.user - The user identity granted permission to the root folder.
 * @property {string[]} permissions.roles - The roles granted to the identities.
 * @property {string} webDavUrl - The WebDAV URL of the root folder.
 */
type ChatSpaceRoot = {
  eTag: string
  id: string
  permissions: [
    {
      grantedTo: [
        {
          user: {
            displayName: string
            id: string
          }
        }
      ]
      roles: string[]
    }
  ]
  webDavUrl: string
}

/**
 * Represents the quota of a space in Chat.
 *
 * @typedef {Object} ChatSpaceQuota
 * @property {number} remaining - The remaining space available in bytes.
 * @property {string} state - The state of the quota.
 * @property {number} total - The total space available in bytes.
 * @property {number} used - The space used in bytes.
 */
type ChatSpaceQuota = {
  remaining: number
  state: string
  total: number
  used: number
}

/**
 * Represents the owner of a space in Chat.
 *
 * @typedef {Object} ChatSpaceOwner
 * @property {Object} user - The user that owns the space.
 * @property {string} user.displayName - The display name of the user.
 * @property {string} user.id - The unique identifier of the user.
 */
type ChatSpaceOwner = {
  user: {
    displayName: string
    id: string
  }
}

/**
 * Represents a space in Chat.
 *
 * @typedef {Object} ChatSpace
 * @property {string} driveAlias - The alias of the drive.
 * @property {string} driveType - The type of the drive.
 * @property {string} id - The unique identifier of the space.
 * @property {string} lastModifiedDateTime - The date and time the space was last modified.
 * @property {string} name - The name of the space.
 * @property {ChatSpaceOwner} owner - The owner of the space.
 * @property {ChatSpaceQuota} quota - The quota of the space.
 * @property {ChatSpaceRoot} root - The root folder of the space.
 * @property {string} webUrl - The URL of the space.
 */
export type ChatSpace = {
  driveAlias: string
  driveType: string
  id: string
  lastModifiedDateTime: string
  name: string
  owner: ChatSpaceOwner
  quota: ChatSpaceQuota
  root: ChatSpaceRoot
  webUrl: string
}
