import { jsonParse } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import JSZip from 'jszip'
import { EditorCommand } from 'src/editor/editor/command'
import { mockCollide } from 'src/editor/editor/mock/collide'
import { EditorSetting } from 'src/editor/editor/setting'
import { HandleNode } from 'src/editor/handle/node'
import { OperateGeometry } from 'src/editor/operate/geometry'
import { ISchema } from 'src/editor/schema/type'
import { StageCursor } from 'src/editor/stage/cursor'
import { YSync } from 'src/editor/y-state/y-sync'
import { FileService } from 'src/global/service/file'
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

const jsZip = new JSZip()

@autobind
export class EditorService {
  inited$ = Signal.create(false)

  private initHooks() {
    EditorSetting.init()
    EditorCommand.init()

    HandleNode.init()

    OperateNode.initHook()
    OperateAlign.initHook()
    OperateGeometry.initHook()
    OperateFill.initHook()
    OperateStroke.initHook()
    OperateShadow.initHook()
    OperateText.initHook()

    StageScene.initHook()
    // StageViewport.init()
    StageInteract.init()
    StageDrop.initHook()
    StageCursor.initHook()

    // UIPickerCopy.initHook()
  }

  dispose() {
    Editor.inited$.value = false
    YState.inited$.value = false

    StageInteract.dispose()
    StageScene.dispose()
  }

  initSchema = async (fileId: string, onProgress?: (progress: number) => void) => {
    if (fileId === 'mock') {
      let mockSchema = mockCollide()
      if (mockSchema) {
        // Schema.initSchema(mockSchema)
        YState.initSchema(fileId, mockSchema as unknown as V1.Schema)
        YClients.init()
      }
    } else {
      const fileMeta = await FileService.getFileMeta(fileId)
      if (fileMeta) {
        const zipBuffer = await FileService.loadFile(fileMeta.url, onProgress)
        const zipFiles = await jsZip.loadAsync(zipBuffer)
        const fileText = await zipFiles
          .file(`${decodeURIComponent(fileMeta.name)}.json`)
          ?.async('text')
        const schema = jsonParse(fileText) as ISchema
        Schema.initSchema(schema)

        YState.initSchema(fileId, schema as unknown as V1.Schema)
        YClients.init()
        YSync.init(fileId, YState.doc)

        StageViewport.init()
      }
    }

    // UILeftPanelLayer.initHook()
    // UILeftPanelLayer.init()
  }

  initEditor = async () => {
    if (this.inited$.value) return

    this.initHooks()
    this.inited$.dispatch(true)
  }
}

export const Editor = new EditorService()
