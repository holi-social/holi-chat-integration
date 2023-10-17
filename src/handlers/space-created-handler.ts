import { logPhase } from '../logger'
import { shareSpaceWithUser } from '../chat-api'
import { SpaceCreatedDataPayload, ChatRole } from '../types'
import { HOLI_CHAT_SERVER_URL } from '../constants'
const sdk = require('matrix-js-sdk')

export enum ChatRoomEvent {
  SharedData = 'holi.room.shared.data',
}

//Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceCreatedHandler = async (messageId: string, payload: SpaceCreatedDataPayload): Promise<void> => {
  console.log('++++++++= space_created_handler: SPACE CREATED', messageId, payload)

  const chatClient = sdk.createClient({
    baseUrl: HOLI_CHAT_SERVER_URL,
    // accessToken: 'admin-token',
    // userId: '@chat:local.chat.holi.social',
  })

  console.log('-*-*-*-*-*', chatClient)

  // const createSpace = async (name: string, holiSpaceId: string, inviteUsers: string[]) => {
  //   /*
  //     create space room (used as invisible wrapper for all current space related rooms)
  //   */
  //   const { room_id: containerSpaceRoomId } = await chatClient.createRoom({
  //     name: name,
  //     room_alias_name: name.toLowerCase().replace(/[ ]/g, '.').trim(),
  //     preset: Preset.PrivateChat,
  //     visibility: Visibility.Private,
  //     is_direct: false,
  //     creation_content: {
  //       type: RoomType.Space,
  //     },
  //     invite: inviteUsers,
  //   })

  //   await chatClient.sendStateEvent(containerSpaceRoomId, ChatRoomEvent.SharedData, { holiSpaceId })

  //   /*
  //     create space general room
  //   */
  //   const { room_id: generalSpaceRoomId } = await chatClient.createRoom({
  //     is_direct: false,
  //     preset: Preset.PrivateChat,
  //     visibility: Visibility.Private,
  //     name: '#general',
  //     invite: inviteUsers,
  //   })

  //   /*
  //     Connect space wrapper with general space room
  //   */
  //   // 1. add custom data into general room
  //   await chatClient.sendStateEvent(generalSpaceRoomId, ChatRoomEvent.SharedData, {
  //     holiSpaceId,
  //     parrentSpaceRoomId: containerSpaceRoomId,
  //     spaceName: name,
  //   })

  //   // 2. connect add general room into space room
  //   return await chatClient.sendStateEvent(
  //     containerSpaceRoomId,
  //     EventType.SpaceChild,
  //     { via: [chatServerUrl] },
  //     generalSpaceRoomId
  //   )
  // }

  // try {
  //   const { creator, space } = payload

  //   const ocisUser = await logPhase(
  //     messageId,
  //     'spaceCreatedHandler.findOrCreateOcisUser'
  //   )(() => findOrCreateOcisUser(creator))

  //   const ocisSpace = await logPhase(
  //     messageId,
  //     'spaceCreatedHandler.findOrCreateOcisSpace'
  //   )(() => findOrCreateOcisSpace(space))

  //   //Shares the new space with the user with the "manager" role
  //   await logPhase(
  //     messageId,
  //     'spaceCreatedHandler.shareSpaceWithUser'
  //   )(() => shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.EDITOR))
  // } catch (error) {
  //   throw new Error(`Failed to create space ${error}`)
  // }
}
