import { YClients } from 'src/editor/schema/y-clients'
import { useSnapshot } from 'valtio'

export function useSelectIds() {
  const { selectIds } = useSnapshot(YClients.client)
  return useMemo(() => Object.keys(selectIds), [selectIds])
}

export function useSelectPageId() {
  const { selectPageId } = useSnapshot(YClients.client)
  return selectPageId
}
