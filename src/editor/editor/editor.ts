import { jsonParse } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import JSZip from 'jszip'
import { EditorCommand } from 'src/editor/editor/command'
import { mockCollide } from 'src/editor/editor/mock/collide'
import { EditorSetting } from 'src/editor/editor/setting'
import { HandleNode } from 'src/editor/handle/node'
import { OperateGeometry } from 'src/editor/operate/geometry'
import { StageCursor } from 'src/editor/stage/cursor'
import { Surface } from 'src/editor/render/surface'
import { StageToolGrid } from 'src/editor/stage/tools/grid'
import { YSync } from 'src/editor/y-state/y-sync'
import { FileService } from 'src/global/service/file'
import { Disposer } from 'src/utils/disposer'
import { OperateAlign } from '../operate/align'
import { OperateFill } from '../operate/fill'
import { OperateShadow } from '../operate/shadow'
import { OperateStroke } from '../operate/stroke'
import { OperateText } from '../operate/text'
import { Schema } from '../schema/schema'
import { StageDrop } from '../stage/drop'
import { StageInteract } from '../stage/interact/interact'
import { StageScene } from 'src/editor/render/scene'
import { StageViewport } from '../stage/viewport'

const jsZip = new JSZip()

@autobind
export class EditorService {
  inited = Signal.create(false)
  private disposer = new Disposer()

  private subscribe() {
    return Disposer.collect(Surface.subscribe(), StageViewport.subscribe())
  }

  private initHooks() {
    EditorSetting.init()
    EditorCommand.init()

    HandleNode.init()

    OperateAlign.initHook()
    OperateGeometry.initHook()
    OperateFill.init()
    OperateStroke.initHook()
    OperateShadow.initHook()
    OperateText.initHook()

    StageScene.initHook()
    StageInteract.init()
    StageDrop.initHook()
    StageCursor.initHook()
    StageToolGrid.init()
  }

  dispose() {
    Editor.inited.value = false
    YState.inited$.value = false

    StageInteract.dispose()
    StageScene.dispose()

    this.disposer.dispose()
  }

  initSchema = async (fileId: string, onProgress?: (progress: number) => void) => {
    if (fileId === 'mock') {
      let mockSchema = mockCollide()
      if (mockSchema) {
        // Schema.initSchema(mockSchema)
        YState.initSchema(fileId, mockSchema as unknown as V1.Schema)
        this.disposer.add(YClients.init())
        this.disposer.add(YSync.init(fileId, YState.doc))
        StageViewport.init()
      }
    } else {
      const fileMeta = await FileService.getFileMeta(fileId)
      if (fileMeta) {
        const zipBuffer = await FileService.loadFile(fileMeta.url, onProgress)
        const zipFiles = await jsZip.loadAsync(zipBuffer)
        const fileText = await zipFiles
          .file(`${decodeURIComponent(fileMeta.name)}.json`)
          ?.async('text')
        const schema = jsonParse(fileText) as V1.Schema
        Schema.initSchema(schema)

        YState.initSchema(fileId, schema as unknown as V1.Schema)
        this.disposer.add(YClients.init())
        this.disposer.add(YSync.init(fileId, YState.doc))
        StageViewport.init()
      }
    }
  }

  initEditor = async () => {
    if (this.inited.value) return

    this.disposer.add(this.subscribe())
    this.initHooks()
    this.inited.dispatch(true)
  }
}

export const Editor = new EditorService()
