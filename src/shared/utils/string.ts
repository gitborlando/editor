export default function isUrl(string: string) {
  try {
    new URL(string) // eslint-disable-line no-new
    return true
  } catch {
    return isUrl(`http://${string}`)
  }
}
