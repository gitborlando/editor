// 自动生成的静态资源路径常量
import editorCursorResize from './editor/cursor/resize.svg'
import editorCursorSelect from './editor/cursor/select.svg'
import editorHeaderStageOperateMove from './editor/header/stage-operate/move.svg'
import editorHeaderStageOperateSelect from './editor/header/stage-operate/select.svg'
import editorNodeEllipse from './editor/node/ellipse.svg'
import editorNodeFrame from './editor/node/frame.svg'
import editorNodeImage from './editor/node/image.svg'
import editorNodeLine from './editor/node/line.svg'
import editorNodePolygon from './editor/node/polygon.svg'
import editorNodeRect from './editor/node/rect.svg'
import editorNodeStar from './editor/node/star.svg'
import editorNodeText from './editor/node/text.svg'
import editorRightPanelOperateAlignAlignCenter from './editor/right-panel/operate/align/align-center.svg'
import editorRightPanelOperateAlignAlignLeft from './editor/right-panel/operate/align/align-left.svg'
import editorRightPanelOperateAlignAlignRight from './editor/right-panel/operate/align/align-right.svg'
import editorRightPanelOperateAlignVerticalBottom from './editor/right-panel/operate/align/vertical-bottom.svg'
import editorRightPanelOperateAlignVerticalCenter from './editor/right-panel/operate/align/vertical-center.svg'
import editorRightPanelOperateAlignVerticalTop from './editor/right-panel/operate/align/vertical-top.svg'
import editorRightPanelOperateFillNone from './editor/right-panel/operate/fill/none.png'
import editorRightPanelOperateGeoX from './editor/right-panel/operate/geo/x.svg'
import editorRightPanelOperatePickerDefaultImage from './editor/right-panel/operate/picker/default-image.png'
import favIconShiyangyang from './fav-icon/shiyangyang.png'

export const Assets = {
  editor: {
    cursor: {
      resize: editorCursorResize,
      select: editorCursorSelect,
    },
    header: {
      stageOperate: {
        move: editorHeaderStageOperateMove,
        select: editorHeaderStageOperateSelect,
      },
    },
    node: {
      ellipse: editorNodeEllipse,
      frame: editorNodeFrame,
      image: editorNodeImage,
      line: editorNodeLine,
      polygon: editorNodePolygon,
      rect: editorNodeRect,
      star: editorNodeStar,
      text: editorNodeText,
    },
    RP: {
      operate: {
        align: {
          alignCenter: editorRightPanelOperateAlignAlignCenter,
          alignLeft: editorRightPanelOperateAlignAlignLeft,
          alignRight: editorRightPanelOperateAlignAlignRight,
          verticalBottom: editorRightPanelOperateAlignVerticalBottom,
          verticalCenter: editorRightPanelOperateAlignVerticalCenter,
          verticalTop: editorRightPanelOperateAlignVerticalTop,
        },
        fill: {
          none: editorRightPanelOperateFillNone,
        },
        geo: {
          x: editorRightPanelOperateGeoX,
        },
        picker: {
          defaultImage: editorRightPanelOperatePickerDefaultImage,
        },
      },
    },
  },
  favIcon: {
    shiyangyang: favIconShiyangyang,
  },
} as const
