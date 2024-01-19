import { createSignal } from '~/shared/signal'
import { SchemaFile } from './file'
import { OperateGeometry } from './operate/geometry'
import { SchemaNode } from './schema/node'
import { SchemaPage } from './schema/page'
import { Schema } from './schema/schema'
import { SchemaUtil } from './schema/util'
import { StageCursor } from './stage/cursor'
import { StageDraw } from './stage/draw/draw'
import { StageElement } from './stage/element'
import { StageCreate } from './stage/interact/create'
import { StageInteract } from './stage/interact/interact'
import { StageSelect } from './stage/interact/select'
import { StageViewport } from './stage/viewport'
import { StageWidgetAdsorption } from './stage/widget/adsorption'
import { StageWidgetHover } from './stage/widget/hover'
import { StageWidgetMarquee } from './stage/widget/marquee'
import { StageWidgetRuler } from './stage/widget/ruler'
import { StageWidgetTransform } from './stage/widget/transform'
import { UILeftPanelLayer } from './ui-state/left-panel/layer'
import { UILeftPanel } from './ui-state/left-panel/left-panel'

export const editorInited = createSignal(false)

SchemaPage.initHook()
SchemaNode.initHook()

OperateGeometry.initHook()

StageViewport.initHook()
StageElement.initHook()
StageDraw.initHook()
StageInteract.initHook()
StageSelect.initHook()
StageCreate.initHook()
StageCursor.initHook()

StageWidgetHover.initHook()
StageWidgetMarquee.initHook()
StageWidgetRuler.initHook()
StageWidgetAdsorption.initHook()
StageWidgetTransform.initHook()

UILeftPanelLayer.initHook()

export async function initEditor() {
  SchemaFile.init()
  const json = await SchemaFile.mockFile()
  Schema.setSchema(json)
  SchemaPage.select(json.pages[0].id)
  SchemaUtil.init()
  Schema.inited.dispatch(true)

  UILeftPanelLayer.init()
  UILeftPanel.init()

  editorInited.dispatch(true)
}
