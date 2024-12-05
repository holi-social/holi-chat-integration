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

export const authedFetchResponse = async (
  url: string,
  method: string,
  body?: object
): Promise<{ status: number; json: { errcode?: string; error?: string } }> => {
  const init = {
    method: method,
    headers: { Authorization: `Bearer ${CHAT_ADMIN_ACCESS_TOKEN}` }
  }
  if (body) {
    init['body'] = JSON.stringify(body)
  }

  try {
    let response = await fetch(CHAT_SERVER_URL + url, init)

    if (response.ok) {
      try {
        const json = await response.json()
        return { status: response.status, json }
      } catch {
        console.error(`Failed to parse Matrix response: ${JSON.stringify(response)}`)
        return { status: response.status, json: {} }
      }
    } else {
      console.error(`Matrix request failed with status ${response.status}: ${JSON.stringify(response)}`)
      return { status: response.status, json: {} }
    }
  } catch (e) {
    console.error(`Error while trying to contact Matrix server: ${JSON.stringify(e)}`)
    return { status: 500, json: {} }
  }
}

export const authedFetchJson = async (url: string, method: string, body?: object) => {
  const response = await authedFetchResponse(url, method, body)
  if (response.status >= 400) {
    throw new Error(`Matrix request failed with status ${response.status}: ${JSON.stringify(response.json)}`)
  }
  return response.json
}

export const wait = async (delay: number) => {
  await new Promise((resolve) => setTimeout(resolve, delay))
}

