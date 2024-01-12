import EditorHeaderShiyangyang from './editor/header/shiyangyang.png'
import EditorHeaderToolsMove from './editor/header/tools/move.tsx'
import EditorHeaderToolsSelect from './editor/header/tools/select.tsx'
import EditorLeftPanelNodeCollapse from './editor/left-panel/node/collapse.tsx'
import EditorLeftPanelPageAdd from './editor/left-panel/page/add.tsx'
import EditorLeftPanelPageCollapse from './editor/left-panel/page/collapse.tsx'
import EditorLeftPanelPagePageSelect from './editor/left-panel/page/page-select.tsx'
import EditorLeftPanelSwitchBarComponent from './editor/left-panel/switch-bar/component.tsx'
import EditorLeftPanelSwitchBarLayer from './editor/left-panel/switch-bar/layer.tsx'
import EditorLeftPanelSwitchBarToLeft from './editor/left-panel/switch-bar/to-left.tsx'
import EditorNodeEllipse from './editor/node/ellipse.tsx'
import EditorNodeFrame from './editor/node/frame.tsx'
import EditorNodeImage from './editor/node/image.tsx'
import EditorNodeLine from './editor/node/line.tsx'
import EditorNodeRect from './editor/node/rect.tsx'
import EditorNodeStar from './editor/node/star.tsx'
import EditorNodeTriangle from './editor/node/triangle.tsx'
import EditorSharedDelete from './editor/shared/Delete.tsx'
import EditorWidgetNumberInputOperateUp from './editor/widget/number-input/operate-up.tsx'

const Asset = {
  editor: {
    header: {
      shiyangyang: EditorHeaderShiyangyang,
      tools: {
        move: EditorHeaderToolsMove,
        select: EditorHeaderToolsSelect,
      },
    },
    leftPanel: {
      node: {
        collapse: EditorLeftPanelNodeCollapse,
      },
      page: {
        add: EditorLeftPanelPageAdd,
        collapse: EditorLeftPanelPageCollapse,
        pageSelect: EditorLeftPanelPagePageSelect,
      },
      switchBar: {
        component: EditorLeftPanelSwitchBarComponent,
        layer: EditorLeftPanelSwitchBarLayer,
        toLeft: EditorLeftPanelSwitchBarToLeft,
      },
    },
    node: {
      ellipse: EditorNodeEllipse,
      frame: EditorNodeFrame,
      image: EditorNodeImage,
      line: EditorNodeLine,
      rect: EditorNodeRect,
      star: EditorNodeStar,
      triangle: EditorNodeTriangle,
    },
    shared: {
      delete: EditorSharedDelete,
    },
    widget: {
      numberInput: {
        operateUp: EditorWidgetNumberInputOperateUp,
      },
    },
  },
}

export default Asset
