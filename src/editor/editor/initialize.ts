import { OperateGeometry } from '~/editor/operate/geometry'
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
import { StageDrop } from '../stage/drop'
import { StageInteract } from '../stage/interact/interact'
import { Pixi } from '../stage/pixi'
import { StageViewport } from '../stage/viewport'
import { StageWidgetAdsorption } from '../stage/widget/adsorption'
import { StageWidgetTransform } from '../stage/widget/transform'
import { UILeftPanelLayer } from '../ui-state/left-panel/layer'
import { UILeftPanel } from '../ui-state/left-panel/left-panel'
import { UIPickerCopy } from '../ui-state/right-panel/operate/picker'
import { EditorCursor } from './cursor'
import { Editor } from './editor'
import { FileManager } from './file-manager'
import { mockFile } from './mock/mock'

export const editorInited = createSignal(false)

Editor.initHook()
EditorCursor.initHook()

FileManager.initHook()
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

StageViewport.initHook()
StageInteract.initHook()
StageDrop.initHook()
EditorCursor.initHook()
StageWidgetAdsorption.initHook()
StageWidgetTransform.initHook()

UILeftPanelLayer.initHook()
UILeftPanel.initHook()
UIPickerCopy.initHook()

export async function initEditor() {
  FileManager.init()

  await mockFile()

  if (location.hash === '') {
    location.hash = 'test-file-1'
  }

  const fileId = location.hash.slice(1)
  Schema.initSchema((await FileManager.fileForage.getItem(fileId))!)

  UILeftPanelLayer.init()

  editorInited.dispatch(true)
}
