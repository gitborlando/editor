import { createSignal } from '~/shared/signal/signal'

const defaultSettings = {
  autosave: true,
}

const storageSettings = localStorage.getItem('editorSettings')

export type IEditorSettings = typeof defaultSettings

export const editorSettings = createSignal<IEditorSettings>(
  storageSettings ? JSON.parse(storageSettings) : defaultSettings
)

editorSettings.hook({ afterAll: true }, () => {
  localStorage.setItem('editorSettings', JSON.stringify(editorSettings.value))
})
