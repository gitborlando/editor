import { jsonFy, jsonParse } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { proxy, snapshot, subscribe } from 'valtio'

const initSetting = () => {
  return {
    autosave: true,
    showFPS: true,
    devMode: false,
    ignoreUnVisible: true,
    menuShowTopTab: true,
    needSliceRender: true,
    mockMode: false,
  }
}

@autobind
class EditorSettingService {
  setting = proxy(initSetting())

  init() {
    this.autoSaveSetting()
    this.loadSetting()
  }

  private loadSetting() {
    const savedSetting = jsonParse(localStorage.getItem('editor.setting'))
    Object.assign(this.setting, savedSetting || initSetting())
  }

  private autoSaveSetting() {
    subscribe(this.setting, () => {
      const setting = snapshot(this.setting)
      localStorage.setItem('editor.setting', jsonFy(setting) || '')
    })
  }
}

export const EditorSetting = new EditorSettingService()
