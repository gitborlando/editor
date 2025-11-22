import { jsonFy, jsonParse } from '@gitborlando/utils'
import { Matrix } from 'src/editor/math/matrix'
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
      matrix: Matrix.identity().tuple(),
    },
  }
}

class EditorSettingService {
  inited = Signal.create(false)
  @observable setting = initSetting()

  init() {
    this.loadSetting()
    this.autoSaveSetting()
    this.inited.dispatch(true)
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

export const EditorSetting = autoBind(makeObservable(new EditorSettingService()))

export function getEditorSetting() {
  return EditorSetting.setting
}
