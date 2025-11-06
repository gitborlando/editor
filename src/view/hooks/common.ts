import { listen } from '@gitborlando/utils/browser'

export function useUnmount(callback: () => void) {
  useEffect(() => {
    return callback
  }, [])
}

export function useMousedownBlur(el: HTMLInputElement | null) {
  useEffect(() => {
    return listen('mousedown', () => el?.blur())
  }, [el])
}
