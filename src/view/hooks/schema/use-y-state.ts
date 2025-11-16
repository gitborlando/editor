import { getSelectIdList, getSelectPageId } from 'src/editor/y-state/y-clients'
import { useShallow } from 'src/view/hooks/schema/use-shallow'

export function useSelectNodes() {
  const selectIds = getSelectIdList()
  return useSchema(
    useShallow((state) => selectIds.map((id) => state[id] as V1.Node)),
  )
}

export function useSelectPage() {
  const selectPageId = getSelectPageId()
  return useSchema((state) => state[selectPageId] as V1.Page)
}

export function useSchema<T>(selector: (state: V1.Schema) => T): T {
  return useSyncExternalStore(YState.subscribe, () => selector(YState.state))
}
