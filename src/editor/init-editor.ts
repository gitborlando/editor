import { createSignal } from '~/shared/signal'
import { File } from './file'
import { OperateGeometry } from './operate/geometry'
import { SchemaNode } from './schema/node'
import { SchemaPage } from './schema/page'
import { Schema } from './schema/schema'
import { StageCursor } from './stage/cursor'
import { StageElement } from './stage/element'
import { StageInteract } from './stage/interact/interact'
import { StageSelect } from './stage/interact/select'
import { StageTransform } from './stage/interact/transform'
import { StageViewport } from './stage/viewport'
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
StageInteract.initHook()
StageSelect.initHook()
StageCursor.initHook()
StageTransform.initHook()

StageWidgetHover.initHook()
StageWidgetMarquee.initHook()
StageWidgetRuler.initHook()
StageWidgetTransform.initHook()

UILeftPanelLayer.initHook()

export async function initEditor() {
  const json = await File.mockFile()
  Schema.setSchema(json)
  SchemaPage.select(json.pages[0].id)
  Schema.inited.dispatch(true)

  UILeftPanelLayer.init()
  UILeftPanel.init()

  editorInited.dispatch(true)
}
