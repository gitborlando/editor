import { IBound } from './normal'

export function rectInAnotherRect(rectA: IBound, rectB: IBound) {
  if (rectA.x < rectB.x) return false
  if (rectA.y < rectB.y) return false
  if (rectA.x + rectA.width > rectB.x + rectB.width) return false
  if (rectA.y + rectA.height > rectB.y + rectB.height) return false
  return true
}
