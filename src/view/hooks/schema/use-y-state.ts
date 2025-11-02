import { useShallow } from 'src/view/hooks/schema/use-shallow'
import { useSelectIds, useSelectPageId } from 'src/view/hooks/schema/use-y-client'

export function useSelectNodes() {
  const selectIds = useSelectIds()
  return useSchema(
    useShallow((state) => selectIds.map((id) => state[id] as V1.Node)),
  )
}

export function useSelectPage() {
  const selectPageId = useSelectPageId()
  return useSchema((state) => state[selectPageId] as V1.Page)
}

export function useSchema(selector: (state: V1.Schema) => any) {
  return useSyncExternalStore(YState.immut.subscribe, () => selector(YState.state))
}
