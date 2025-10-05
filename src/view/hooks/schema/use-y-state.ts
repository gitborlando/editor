import { useSelectIds } from 'src/view/hooks/schema/use-y-client'
import { useSnapshot } from 'valtio'

export function useSelectNodes() {
  const selectIds = useSelectIds()
  const state = useSnapshot(YState.proxy)
  return useMemo(() => selectIds.map((id) => state[id]), [selectIds, state])
}
