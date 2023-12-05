import { createContext, useContext } from 'react'
import { editorServices } from '~/editor/ioc'

export const EditorServicesContext = createContext<typeof editorServices>(null!)

export function useEditorServices() {
  return useContext(EditorServicesContext)!
}
