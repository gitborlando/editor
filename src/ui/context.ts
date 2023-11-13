import { createContext, useContext } from 'react'
import { EditorService } from '~/service/editor/editor'

export const EditorContext = createContext<EditorService | null>(null)

export function useEditor() {
  const editor = useContext(EditorContext)
  if (!editor) throw new Error('no editor instance yet')
  return editor
}
