import { useEffect } from 'react'
import { INoopFunc } from './normal'

export function downUpTracker(
  el: HTMLElement | null,
  _downCallback: INoopFunc,
  _upCallback: INoopFunc
) {
  if (!el) return
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

export function useDownUpTracker(
  elCallback: () => HTMLElement | null,
  downCallback: INoopFunc,
  upCallback: INoopFunc,
  deps: any[] = []
) {
  useEffect(() => downUpTracker(elCallback(), downCallback, upCallback), deps)
}
