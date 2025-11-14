import { jsonFy, jsonParse } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { defuOverrideArray } from 'src/utils/defu'

const initSetting = () => {
  return {
    autosave: true,
    showFPS: true,
    devMode: false,
    ignoreUnVisible: true,
    menuShowTopTab: true,
    needSliceRender: true,
    mockMode: false,
    showDirtyRect: false,
    dev: {
      solidZoomAndOffset: true,
      zoom: 100,
      offset: XY._(100, 100),
    },
  }
}

@autobind
class EditorSettingService {
  @observable setting = initSetting()

  constructor() {
    makeObservable(this)
  }

  init() {
    this.loadSetting()
    this.autoSaveSetting()
  }

  private loadSetting() {
    const savedSetting = jsonParse(localStorage.getItem('editor.setting'))
    this.setting = defuOverrideArray(savedSetting, initSetting())
  }

  private autoSaveSetting() {
    reaction(
      () => jsonFy(this.setting),
      (json) => localStorage.setItem('editor.setting', json || ''),
    )
  }
}

export const EditorSetting = new EditorSettingService()

export function getEditorSetting() {
  return EditorSetting.setting
}
