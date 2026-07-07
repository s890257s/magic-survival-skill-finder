export const exportDataToToken = (dataObj) => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(dataObj)))
  } catch (e) {
    console.error('Failed to export data', e)
    return ''
  }
}

export const parseTokenToData = (token) => {
  try {
    const jsonStr = decodeURIComponent(atob(token))
    return JSON.parse(jsonStr)
  } catch (e) {
    console.error('Failed to parse share token', e)
    return null
  }
}
