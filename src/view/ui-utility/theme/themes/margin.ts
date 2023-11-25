function _margin(allPading: number): string
function _margin(vMargin: number, hMargin: number): string
function _margin(tMargin: number, rMargin?: number, bMargin?: number, lMargin?: number): string
function _margin(tMargin: number, rMargin?: number, bMargin?: number, lMargin?: number) {
  if (lMargin && bMargin) return `${tMargin}px ${rMargin}px ${bMargin}px ${lMargin}px`
  if (rMargin) return `${tMargin}px ${rMargin}px`
  return `${tMargin}px`
}
export const margin = (tMargin: number, rMargin?: number, bMargin?: number, lMargin?: number) => ({
  margin: _margin(tMargin, rMargin, bMargin, lMargin),
})
export const marginTop = (marginTop: number) => ({ marginTop })
export const marginRight = (marginRight: number) => ({ marginRight })
export const marginBottom = (marginBottom: number) => ({ marginBottom })
export const marginLeft = (marginLeft: number) => ({ marginLeft })
export const marginHorizontal = (marginHorizontal: number) => ({
  marginLeft: marginHorizontal,
  marginRight: marginHorizontal,
})
export const marginVertical = (marginVertical: number) => ({
  marginLeft: marginVertical,
  marginRight: marginVertical,
})
