import { jsonFy, jsonParse } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { produce } from 'immer'
import { autorun, makeAutoObservable, observable } from 'mobx'

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
  setting = initSetting()

  constructor() {
    makeAutoObservable(this, {
      setting: observable.ref,
    })
    this.autoSaveSetting()
    this.loadSetting()
  }

  private loadSetting() {
    const savedSetting = jsonParse(localStorage.getItem('editor.setting'))
    if (savedSetting) {
      this.setting = savedSetting
    } else {
      this.setting = initSetting()
    }
  }

  private autoSaveSetting() {
    autorun(() => {
      localStorage.setItem('editor.setting', jsonFy(this.setting) || '')
    })
  }

  setSetting(setter: ImmerSetter<typeof this.setting>) {
    this.setting = produce(this.setting, setter)
  }
}

export const EditorSetting = new EditorSettingService()
