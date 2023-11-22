import { createContext, useContext } from 'react'
import { EditorService } from '~/editor/editor'
import { IServiceMap } from '~/editor/service'

export const EditorContext = createContext<EditorService | null>(null)

export function useEditor() {
  const editor = useContext(EditorContext)
  if (!editor) throw new Error('no editor instance yet')
  return editor
}

export const ServiceContext = createContext<IServiceMap | null>(null)

export function useService(): IServiceMap
export function useService<K extends keyof IServiceMap>(serviceKey?: K) {
  const serviceMap = useContext(ServiceContext)
  if (!serviceMap) throw new Error('no serviceMap instance yet')
  if (!serviceKey) return serviceMap
  const service = serviceMap?.[serviceKey]
  if (!service) throw new Error('no service instance yet')
  return service
}
