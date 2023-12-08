/*
  This allows to create a limited amount of retries for a messageId.
  The process has some inherent flaws.
  This only works, when the function is not restarted (which would reset the counters)
  If parallel function instances are present, this also does not work reliably and can lead to memory leakage,
  because the deleteCount is never called, when the successfull execution is done in another instance.
  So it's more a best effort to limit the number of retries, but it's not accurate.

  Usage: Call retryExceeded(messageId). If true, return successfully, to stop retrying. Otherwise throw an error to trigger a retry.
  deleteCount(messageId) must be called for *every* message, that was processed successfully.
*/

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
