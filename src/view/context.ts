import { createContext, useContext } from 'react'
import { editorServices } from '~/editor/ioc'

export const EditorContext = createContext<typeof editorServices>(null!)

export function useEditor() {
  return useContext(EditorContext)!
}
