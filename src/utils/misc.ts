export function createUrlFromSvgString(svgString: string) {
  return URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml' }))
}
