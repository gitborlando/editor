import { createContext, useContext } from 'react'
import { INode, ISchema } from '~/editor/schema/type'

export const EditorSchemaContext = createContext<ISchema>(null!)

export function useSchema() {
  return useContext(EditorSchemaContext)
}

export const EditorSelectedNodesContext = createContext<INode[]>(null!)

export function useSelectedNodes() {
  return useContext(EditorSelectedNodesContext)
}
