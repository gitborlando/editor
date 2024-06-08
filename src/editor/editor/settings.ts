import { createSignal } from 'src/shared/signal/signal'

export type IEditorSettings = typeof defaultSettings

const defaultSettings = {
  autosave: true,
  menuShowTopTab: true,
}

const settingStr = localStorage.getItem('editorSettings')

export const editorSettings: IEditorSettings = settingStr ? JSON.parse(settingStr) : defaultSettings

export function setSettings(setFunc: (settings: IEditorSettings) => void) {
  setFunc(editorSettings)
  onSettingsChanged.dispatch(editorSettings)
  localStorage.setItem('editorSettings', JSON.stringify(editorSettings))
}

export const onSettingsChanged = createSignal<IEditorSettings>(editorSettings)
