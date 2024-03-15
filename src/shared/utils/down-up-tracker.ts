import { useEffect } from 'react'
import { INoopFunc } from './normal'

export function downUpTracker(el: HTMLElement, _downCallback: INoopFunc, _upCallback: INoopFunc) {
  const downCallback = () => {
    _downCallback()
    window.addEventListener('mouseup', upCallback)
  }
  const upCallback = () => {
    _upCallback()
    window.removeEventListener('mouseup', upCallback)
  }
  el.addEventListener('mousedown', downCallback)
  return () => el.removeEventListener('mousedown', downCallback)
}

export function useDownUpTracker(el: HTMLElement, downCallback: INoopFunc, upCallback: INoopFunc) {
  useEffect(() => downUpTracker(el, downCallback, upCallback))
}
