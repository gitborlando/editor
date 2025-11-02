export function createUrlFromSvgString(svgString: string) {
  return URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml' }))
}

export const recordTime = (
  name: string,
  func: (logTime: (label: string) => void) => void,
) => {
  const start = performance.now()
  let lastTime = start
  func((label) => {
    const now = performance.now()
    console.log(`${label}: ${now - lastTime}ms`)
    lastTime = now
  })
  console.log(`${name} total: ${performance.now() - start}ms`)
}
