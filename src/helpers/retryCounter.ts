const dict = new Object()

const MAX_RETRIES = 10

export const getCount = (messageId: string) => {
  const val = dict[messageId]
  if (val) return val
  else return 0
}

export const retryExceeded = (messageId: string) => {
  const val = dict[messageId]
  if (val) {
    if (val >= MAX_RETRIES) return true
    dict[messageId] = val + 1
    return false
  } else {
    dict[messageId] = 1
    return false
  }
}

export const deleteCount = (messageId: string) => {
  delete dict[messageId]
}
