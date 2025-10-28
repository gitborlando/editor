import { YClients } from 'src/editor/schema/y-clients'
import { useSnapshot } from 'valtio'

export function useSelectIds() {
  const { selectIds } = useSnapshot(YClients.client)
  return useMemo(() => Object.keys(selectIds), [selectIds])
}

export function useAllSelectIdMap() {
  const { selectIds } = useSnapshot(YClients.client)
  const othersSnap = useSnapshot(YClients.others)
  return useMemo(() => {
    const allSelectIdMap = {}
    Object.assign(allSelectIdMap, selectIds)
    for (const [_, client] of Object.entries(othersSnap)) {
      Object.assign(allSelectIdMap, client.selectIds)
    }
    return t<Record<string, boolean>>(allSelectIdMap)
  }, [selectIds, othersSnap])
}

export function useSelectPageId() {
  const { selectPageId } = useSnapshot(YClients.client)
  return selectPageId
}
