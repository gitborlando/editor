import { createContext, useContext } from 'react'
import { editorServices, globalServices } from '~/ioc'

export const EditorContext = createContext<typeof editorServices>(null!)

export function useEditor() {
  return useContext(EditorContext)!
}

export const GlobalContext = createContext<typeof globalServices>(null!)

export function useGlobalService() {
  return useContext(GlobalContext)!
}
