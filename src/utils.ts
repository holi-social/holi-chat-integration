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
