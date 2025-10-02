import autobind from 'class-autobind-decorator'
import JSZip from 'jszip'
import { EditorCommand } from 'src/editor/editor/command'
import { FileManager } from 'src/editor/editor/file-manager'
import { mockCollide } from 'src/editor/editor/mock/collide'
import { OperateGeometry } from 'src/editor/operate/geometry'
import { ISchema } from 'src/editor/schema/type'
import { StageCursor } from 'src/editor/stage/cursor'
import { createStorageItem } from 'src/global/storage'
import { OperateAlign } from '../operate/align'
import { OperateFill } from '../operate/fill'
import { OperateNode } from '../operate/node'
import { OperateShadow } from '../operate/shadow'
import { OperateStroke } from '../operate/stroke'
import { OperateText } from '../operate/text'
import { Schema } from '../schema/schema'
import { StageDrop } from '../stage/drop'
import { StageInteract } from '../stage/interact/interact'
import { StageScene } from '../stage/render/scene'
import { StageViewport } from '../stage/viewport'
import { UILeftPanelLayer } from '../ui-state/left-panel/layer'
import { UILeftPanel } from '../ui-state/left-panel/left-panel'
import { UIPickerCopy } from '../ui-state/right-panel/operate/picker'

const jsZip = new JSZip()

@autobind
export class EditorService {
  private initHooks() {
    EditorCommand.initHook()

    OperateNode.initHook()
    OperateAlign.initHook()
    OperateGeometry.initHook()
    OperateFill.initHook()
    OperateStroke.initHook()
    OperateShadow.initHook()
    OperateText.initHook()

    StageScene.initHook()
    StageViewport.initHook()
    StageInteract.initHook()
    StageDrop.initHook()
    StageCursor.initHook()

    UILeftPanelLayer.initHook()
    UILeftPanel.initHook()
    UIPickerCopy.initHook()
  }

  private initSchema = async () => {
    let mockSchema = mockCollide()
    if (mockSchema) {
      const schema = mockSchema
      if (!(await FileManager.fileForage.getItem<ISchema>(schema.meta.fileId))) {
        await FileManager.saveFile(schema)
      }
      Schema.initSchema(schema)
    } else {
      if (!location.hash) {
        location.hash = 'test-file-1'
      }

      const fileId = location.hash.slice(1)
      const schema = await FileManager.fileForage.getItem<ISchema>(fileId)

      if (schema) {
        Schema.initSchema(schema)
      } else {
        // const name = listJson[fileId as keyof typeof listJson].name
        // const zipBuffer = await (await fetch(publicPath(`mock/${name}.zip`))).arrayBuffer()
        // const zipFiles = await jsZip.loadAsync(zipBuffer)
        // const fileText = await zipFiles.file(`${name}.json`)?.async('text')
        // const schema = jsonParse(fileText) as ISchema
        // await FileManager.saveFile(schema)
        // Schema.initSchema(schema)
      }
    }
  }

  initEditor = async () => {
    this.initHooks()
    await this.initSchema()
    UILeftPanelLayer.init()
  }

  private createSetting = <T>(name: string, value: T) => {
    return createStorageItem<T>(`Editor.User.${name}`, value)
  }

  settings = {
    autosave: this.createSetting('autoSave', true),
    menuShowTopTab: this.createSetting('menuShowTopTab', true),
    devMode: this.createSetting('devMode', false),
    ignoreUnVisible: this.createSetting('ignoreUnVisible', true),
    showFPS: this.createSetting('showFPS', true),
    needSliceRender: this.createSetting('needSliceRender', true),
  }

  getSetting<T extends keyof EditorService['settings']>(name: T) {
    return this.settings[name].value
  }
}

export const Editor = new EditorService()

export function getEditorSetting<T extends keyof EditorService['settings']>(name: T) {
  return Editor.settings[name].value
}
