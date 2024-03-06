import { CHAT_ADMIN_ACCESS_TOKEN, CHAT_SERVER_URL } from './constants'

/**
 * Sanitizes a space name by removing any occurrences of the following characters:
 * / \ . : ? * " > < |
 *
 * @param {string} name - The space name to sanitize.
 * @returns {string} The sanitized string.
 */
export const sanitizeSpaceName = (name: string): string => {
  const forbiddenChars = /[/\\.:?*"<>|]/g
  const sanitized = name.replace(forbiddenChars, ' ').trim()
  return sanitized.replace(/\s+/g, ' ')
}

export const authedFetchResponse = async (url: string, method: string, body?: object) => {
  const init = {
    method: method,
    headers: { Authorization: `Bearer ${CHAT_ADMIN_ACCESS_TOKEN}` },
  }
  if (body) {
    init['body'] = JSON.stringify(body)
  }
  let response = await fetch(CHAT_SERVER_URL + url, init)
  let retryCount = 10
  while (response.status == 429 && retryCount > 0) {
    retryCount--
    try {
      const json = await response.json()
      const delay = json.retry_after_ms ? json.retry_after_ms : 3000
      await new Promise((resolve) => setTimeout(resolve, delay))
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
    response = await fetch(CHAT_SERVER_URL + url, init)
  }
  if (response.status == 429) {
    try {
      const json = await response.json()
      return { status: response.status, json }
    } catch {
      throw new Error('Matrix request failed with status 429: Rate exceeded')
    }
  }
  try {
    const json = await response.json()
    return { status: response.status, json }
  } catch {
    return { status: response.status, json: {} }
  }
}

export const authedFetchJson = async (url: string, method: string, body?: object) => {
  const response = await authedFetchResponse(url, method, body)
  if (response.status >= 400) {
    throw new Error(`Matrix request failed with status ${response.status}: ${JSON.stringify(response.json)}`)
  }
  return response.json
}
