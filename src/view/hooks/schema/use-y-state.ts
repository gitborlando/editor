import { useSelectIds, useSelectPageId } from 'src/view/hooks/schema/use-y-client'
import { useSnapshot } from 'valtio'

export function useSelectNodes() {
  const selectIds = useSelectIds()
  const state = useSnapshot(YState.state)
  return useMemo(() => selectIds.map((id) => state[id] as V1.Node), [selectIds, state])
}

export function useSelectPage() {
  const selectPageId = useSelectPageId()
  const state = useSnapshot(YState.state)
  return useMemo(() => state[selectPageId] as V1.Page, [selectPageId, state])
}
