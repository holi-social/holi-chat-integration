import { sanitizeSpaceName } from '../utils'

describe('sanitizeSpaceName', () => {
  test('removes forbidden characters from space name', () => {
    const input = 'this / is a \\ space . name : with ? forbidden * characters " > < |'
    const expectedOutput = 'this is a space name with forbidden characters'
    expect(sanitizeSpaceName(input)).toEqual(expectedOutput)
  })

  test('returns space name if it does not contain forbidden characters', () => {
    const input = 'this is a space name without forbidden characters'
    expect(sanitizeSpaceName(input)).toEqual(input)
  })
})
