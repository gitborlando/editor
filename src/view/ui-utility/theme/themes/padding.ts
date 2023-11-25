function _padding(allPading: number): string
function _padding(vPadding: number, hPadding: number): string
function _padding(tPadding: number, rPadding?: number, bPadding?: number, lPadding?: number): string
function _padding(tPadding: number, rPadding?: number, bPadding?: number, lPadding?: number) {
  if (lPadding && bPadding) return `${tPadding}px ${rPadding}px ${bPadding}px ${lPadding}px`
  if (rPadding) return `${tPadding}px ${rPadding}px`
  return `${tPadding}px`
}
export const padding = (
  tPadding: number,
  rPadding?: number,
  bPadding?: number,
  lPadding?: number
) => ({
  padding: _padding(tPadding, rPadding, bPadding, lPadding),
})
export const paddingTop = (paddingTop: number) => ({ paddingTop })
export const paddingRight = (paddingRight: number) => ({ paddingRight })
export const paddingBottom = (paddingBottom: number) => ({ paddingBottom })
export const paddingLeft = (paddingLeft: number) => ({ paddingLeft })
export const paddingHorizontal = (paddingHorizontal: number) => ({
  paddingLeft: paddingHorizontal,
  paddingRight: paddingHorizontal,
})
export const paddingVertical = (paddingVertical: number) => ({
  paddingLeft: paddingVertical,
  paddingRight: paddingVertical,
})
