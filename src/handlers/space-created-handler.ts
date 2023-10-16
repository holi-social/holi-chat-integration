import { logPhase } from '../logger'
import { shareSpaceWithUser } from '../ocis-api'
import { SpaceCreatedDataPayload, OcisRole } from '../types'
import { findOrCreateOcisSpace, findOrCreateOcisUser } from './helpers'

//Handles the SpaceCreated event from Google Cloud Pub/Sub.
export const spaceCreatedHandler = async (messageId: string, payload: SpaceCreatedDataPayload): Promise<void> => {
  console.log('++++++++= SPACE CREATED', messageId, payload)

  try {
    const { creator, space } = payload

    const ocisUser = await logPhase(
      messageId,
      'spaceCreatedHandler.findOrCreateOcisUser'
    )(() => findOrCreateOcisUser(creator))

    const ocisSpace = await logPhase(
      messageId,
      'spaceCreatedHandler.findOrCreateOcisSpace'
    )(() => findOrCreateOcisSpace(space))

    //Shares the new space with the user with the "manager" role
    await logPhase(
      messageId,
      'spaceCreatedHandler.shareSpaceWithUser'
    )(() => shareSpaceWithUser(ocisSpace.id, ocisUser.onPremisesSamAccountName, OcisRole.EDITOR))
  } catch (error) {
    throw new Error(`Failed to create space ${error}`)
  }
}
