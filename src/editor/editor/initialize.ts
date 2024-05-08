import { OperateGeometry } from '~/editor/operate/geometry'
import { getMockFile, mockFile } from '~/mock/mock-file'
import { createSignal } from '~/shared/signal/signal'
import { OperateAlign } from '../operate/align'
import { OperateFill } from '../operate/fill'
import { OperateMeta } from '../operate/meta'
import { OperateNode } from '../operate/node'
import { OperateShadow } from '../operate/shadow'
import { OperateStroke } from '../operate/stroke'
import { OperateText } from '../operate/text'
import { SchemaHistory } from '../schema/history'
import { Schema } from '../schema/schema'
import { ISchema } from '../schema/type'
import { StageCursor } from '../stage/cursor'
import { StageCreate } from '../stage/interact/create'
import { StageInteract } from '../stage/interact/interact'
import { StageSelect } from '../stage/interact/select'
import { Pixi } from '../stage/pixi'
import { StageViewport } from '../stage/viewport'
import { StageWidgetAdsorption } from '../stage/widget/adsorption'
import { StageWidgetTransform } from '../stage/widget/transform'
import { UILeftPanelLayer } from '../ui-state/left-panel/layer'
import { UILeftPanel } from '../ui-state/left-panel/left-panel'
import { UIPickerCopy } from '../ui-state/right-panel/operate/picker'
import { Editor } from './editor'
import { SchemaFile } from './file'

export const editorInited = createSignal(false)

Editor.initHook()

SchemaFile.initHook()
SchemaHistory.initHook()

Pixi.initHook()

OperateMeta.initHook()
OperateNode.initHook()
OperateAlign.initHook()
OperateGeometry.initHook()
OperateFill.initHook()
OperateStroke.initHook()
OperateShadow.initHook()
OperateText.initHook()
OperateText.initHook()

StageViewport.initHook()
StageInteract.initHook()
StageSelect.initHook()
StageCreate.initHook()
StageCursor.initHook()
StageWidgetAdsorption.initHook()
StageWidgetTransform.initHook()

UILeftPanelLayer.initHook()
UILeftPanel.initHook()
UIPickerCopy.initHook()

export async function initEditor() {
  SchemaFile.init()

  mockFile()

  if (location.hash === '') {
    location.hash = 'test-file-1'
  }

  const fileId = location.hash.slice(1)
  let file: ISchema
  if (import.meta.env.DEV && fileId.match(/test-file/)) {
    file = getMockFile(fileId)
  } else {
    file = await SchemaFile.fileStore.get(fileId)
  }
  Schema.initSchema(file)

  UILeftPanelLayer.init()

  editorInited.dispatch(true)
}
