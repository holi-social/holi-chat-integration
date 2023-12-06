// import fetch from 'node-fetch'
import { spaceCreatedHandler } from './handlers/space-created-handler'
import { spaceDeletedHandler } from './handlers/space-deleted-handler'
import { spaceUpdatedHandler } from './handlers/space-updated-handler'
import { spaceUserAddedHandler } from './handlers/space-user-added-handler'
import { spaceUserLeftHandler } from './handlers/space-user-left-handler'
import { spaceUserRemovedHandler } from './handlers/space-user-removed-handler'
import { userDeletedHandler } from './handlers/user-deleted-handler'
import { userNameUpdatedHandler } from './handlers/user-name-updated-handler'
import { deleteCount } from './helpers/retryCounter'
import { logDebug, logError, logPhase, logger } from './logger'

import { EventType } from './types'

// Processes events received from both the Google Pub/Sub Emulator and Cloud Pub/Sub, which have different body structures.
const extractEventDetails = (request) => {
  try {
    const {
      data,
      attributes: { eventType },
      messageId,
    } = request.body.message
    const buffer = Buffer.from(data, 'base64')
    const eventStr = buffer.toString()
    const event = JSON.parse(eventStr)
    logDebug(messageId, 'Event of type ' + eventType + ' extracted successfully: ' + eventStr)
    return { eventType, event, messageId }
  } catch (e) {
    logger.error(
      `Could not parse message from request: ${e.name} - ${e.message} - request body: ${JSON.stringify(request.body)}`
    )
    throw e
  }
}

export const receiveEvent = async (request, response): Promise<void> => {
  const messageId = request.body.message.messageId
  if (messageId.toString() === '9094739147085026') {
    response.sendStatus(200)
    return
  }
  logDebug(messageId, 'Event received')

  const { eventType, event } = extractEventDetails(request)

  await processEvent(messageId, eventType, event, response)
}

export const processEvent = async (messageId, eventType, event, response) => {
  try {
    switch (eventType) {
      case EventType.SPACE_CREATED:
        await logPhase(messageId, 'spaceCreatedHandler')(() => spaceCreatedHandler(messageId, event))
        response.sendStatus(201)
        break
      case EventType.SPACE_UPDATED:
        await logPhase(messageId, 'spaceUpdatedHandler')(() => spaceUpdatedHandler(messageId, event))
        response.sendStatus(201)
        break
      case EventType.SPACE_DELETED:
        await logPhase(messageId, 'spaceDeletedHandler')(() => spaceDeletedHandler(messageId, event))
        response.sendStatus(204)
        break
      case EventType.SPACE_USER_ADDED:
        await logPhase(messageId, 'spaceUserAddedHandler')(() => spaceUserAddedHandler(messageId, event))
        response.sendStatus(200)
        break
      case EventType.USER_NAME_UPDATED:
        await logPhase(messageId, 'userNameUpdatedHandler')(() => userNameUpdatedHandler(messageId, event))
        response.sendStatus(200)
        break
      case EventType.USER_DELETED:
        await logPhase(messageId, 'userDeletedHandler')(() => userDeletedHandler(messageId, event))
        response.sendStatus(204)
        break
      case EventType.SPACE_USER_LEFT:
        await logPhase(messageId, 'spaceUserLeftHandler')(() => spaceUserLeftHandler(messageId, event))
        response.sendStatus(200)
        break
      case EventType.SPACE_USER_REMOVED:
        await logPhase(messageId, 'spaceUserRemovedHandler')(() => spaceUserRemovedHandler(messageId, event))
        response.sendStatus(200)
        break
      default:
        throw new Error(`Received unexpected event of type ${eventType}`)
    }
    deleteCount(messageId)
  } catch (e) {
    logError(messageId, `Error while processing message: ${e.name} - ${e.message}`)
    response.sendStatus(500)
    throw e
  }
}

const functions = require('@google-cloud/functions-framework')
functions.http('receiveEvent', receiveEvent)
