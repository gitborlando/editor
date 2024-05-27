import { OperateGeometry } from 'src/editor/operate/geometry'
import { StageWidgetMarquee } from 'src/editor/stage/render/widget/marquee'
import { OperateAlign } from '../operate/align'
import { OperateFill } from '../operate/fill'
import { OperateNode } from '../operate/node'
import { OperatePage } from '../operate/page'
import { OperateShadow } from '../operate/shadow'
import { OperateStroke } from '../operate/stroke'
import { OperateText } from '../operate/text'
import { SchemaHistory } from '../schema/history'
import { Schema } from '../schema/schema'
import { StageDrop } from '../stage/drop'
import { StageElement } from '../stage/element'
import { StageInteract } from '../stage/interact/interact'
import { Pixi } from '../stage/pixi'
import { StageScene } from '../stage/render/scene'
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

  StageScene.initHook()
  StageElement.initHook()
  StageViewport.initHook()
  StageInteract.initHook()
  StageDrop.initHook()
  // StageWidgetAdsorption.initHook()
  StageWidgetTransform.initHook()
  StageWidgetMarquee.initHook()

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
