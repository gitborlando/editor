import { YClients } from 'src/editor/schema/y-clients'
import { useSnapshot } from 'valtio'

export function useSelectIds() {
  const { selectIds } = useSnapshot(YClients.clientProxy)
  return useMemo(() => Object.keys(selectIds), [selectIds])
}

export function useSelectPageId() {
  const { selectPageId } = useSnapshot(YClients.clientProxy)
  return selectPageId
}
