import { useSelectIds, useSelectPageId } from 'src/view/hooks/schema/use-y-client'
import { useSnapshot } from 'valtio'

export function useSelectNodes() {
  const selectIds = useSelectIds()
  const state = useSnapshot(YState.state)
  return selectIds.map((id) => state[id] as V1.Node)
}

export function useSelectPage() {
  const selectPageId = useSelectPageId()
  const state = useSnapshot(YState.state)
  return state[selectPageId] as V1.Page
}
