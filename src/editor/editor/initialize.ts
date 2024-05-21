import { OperateGeometry } from '~/editor/operate/geometry'
import { OperateAlign } from '../operate/align'
import { OperateFill } from '../operate/fill'
import { OperateNode } from '../operate/node'
import { OperatePage } from '../operate/page'
import { OperateShadow } from '../operate/shadow'
import { OperateStroke } from '../operate/stroke'
import { OperateText } from '../operate/text'
import { SchemaHistory } from '../schema/history'
import { Schema } from '../schema/schema'
import { StageDraw } from '../stage/draw/draw'
import { StageDrop } from '../stage/drop'
import { StageElement } from '../stage/element'
import { StageInteract } from '../stage/interact/interact'
import { Pixi } from '../stage/pixi'
import { StageViewport } from '../stage/viewport'
import { StageWidgetTransform } from '../stage/widget/transform'
import { UILeftPanelLayer } from '../ui-state/left-panel/layer'
import { UILeftPanel } from '../ui-state/left-panel/left-panel'
import { UIPickerCopy } from '../ui-state/right-panel/operate/picker'
import { Editor } from './editor'
import { FileManager } from './file-manager'
import { mockFile } from './mock/mock'

function initHooks() {
  Editor.initHook()
  // EditorCursor.initHook()

  FileManager.initHook()
  SchemaHistory.initHook()

  Pixi.initHook()

  OperatePage.initHook()
  OperateNode.initHook()
  OperateAlign.initHook()
  OperateGeometry.initHook()
  OperateFill.initHook()
  OperateStroke.initHook()
  OperateShadow.initHook()
  OperateText.initHook()

  StageElement.initHook()
  StageViewport.initHook()
  StageInteract.initHook()
  StageDraw.initHook()
  StageDrop.initHook()
  // StageWidgetAdsorption.initHook()
  StageWidgetTransform.initHook()

  UILeftPanelLayer.initHook()
  UILeftPanel.initHook()
  UIPickerCopy.initHook()
}

export async function initEditor() {
  initHooks()

  FileManager.init()

  await mockFile()

  if (location.hash === '') {
    location.hash = 'test-file-1'
  }

  const fileId = location.hash.slice(1)
  Schema.initSchema((await FileManager.fileForage.getItem(fileId))!)

  UILeftPanelLayer.init()
}
