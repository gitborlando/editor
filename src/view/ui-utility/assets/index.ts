import EditorFont华光钢铁直黑中黑 from './editor/font/华光钢铁直黑-中黑.ttf'
import EditorHeaderMenu from './editor/header/menu.tsx'
import EditorHeaderRecordRedo from './editor/header/record/redo.tsx'
import EditorHeaderRecordUndo from './editor/header/record/undo.tsx'
import EditorHeaderStageOperateMove from './editor/header/stage-operate/move.tsx'
import EditorHeaderStageOperateSelect from './editor/header/stage-operate/select.tsx'
import EditorLeftPanelFileNewFile from './editor/left-panel/file/new-file.tsx'
import EditorLeftPanelFileNewFolder from './editor/left-panel/file/new-folder.tsx'
import EditorLeftPanelNodeCollapse from './editor/left-panel/node/collapse.tsx'
import EditorLeftPanelPageAdd from './editor/left-panel/page/add.tsx'
import EditorLeftPanelPageCollapse from './editor/left-panel/page/collapse.tsx'
import EditorLeftPanelPagePageSelect from './editor/left-panel/page/page-select.tsx'
import EditorLeftPanelSwitchBarComponent from './editor/left-panel/switch-bar/component.tsx'
import EditorLeftPanelSwitchBarFile from './editor/left-panel/switch-bar/file.tsx'
import EditorLeftPanelSwitchBarImage from './editor/left-panel/switch-bar/image.tsx'
import EditorLeftPanelSwitchBarLayer from './editor/left-panel/switch-bar/layer.tsx'
import EditorLeftPanelSwitchBarPopup from './editor/left-panel/switch-bar/popup.tsx'
import EditorLeftPanelSwitchBarRecord from './editor/left-panel/switch-bar/record.tsx'
import EditorLeftPanelSwitchBarToLeft from './editor/left-panel/switch-bar/to-left.tsx'
import EditorNodeEllipse from './editor/node/ellipse.tsx'
import EditorNodeFrame from './editor/node/frame.tsx'
import EditorNodeImage from './editor/node/image.tsx'
import EditorNodeLine from './editor/node/line.tsx'
import EditorNodePolygon from './editor/node/polygon.tsx'
import EditorNodeRect from './editor/node/rect.tsx'
import EditorNodeStar from './editor/node/star.tsx'
import EditorNodeText from './editor/node/text.tsx'
import EditorRightPanelOperateAlignAlignCenter from './editor/right-panel/operate/align/align-center.tsx'
import EditorRightPanelOperateAlignAlignLeft from './editor/right-panel/operate/align/align-left.tsx'
import EditorRightPanelOperateAlignAlignRight from './editor/right-panel/operate/align/align-right.tsx'
import EditorRightPanelOperateAlignVerticalBottom from './editor/right-panel/operate/align/vertical-bottom.tsx'
import EditorRightPanelOperateAlignVerticalCenter from './editor/right-panel/operate/align/vertical-center.tsx'
import EditorRightPanelOperateAlignVerticalTop from './editor/right-panel/operate/align/vertical-top.tsx'
import EditorRightPanelOperateFillNone from './editor/right-panel/operate/fill/none.png'
import EditorRightPanelOperatePickerDefaultImage from './editor/right-panel/operate/picker/default-image.png'
import EditorSharedDelete from './editor/shared/Delete.tsx'
import EditorSharedLoading from './editor/shared/loading.tsx'
import EditorSharedLock from './editor/shared/lock.tsx'
import EditorSharedMinus from './editor/shared/minus.tsx'
import EditorSharedUnLock from './editor/shared/un-lock.tsx'
import EditorSharedUnVisible from './editor/shared/un-visible.tsx'
import EditorSharedVisible from './editor/shared/visible.tsx'
import EditorWidgetNumberInputOperateUp from './editor/widget/number-input/operate-up.tsx'
import FavIconShiyangyang from './fav-icon/shiyangyang.png'

const Asset = {
  editor: {
    font: {
      华光钢铁直黑中黑: EditorFont华光钢铁直黑中黑,
    },
    header: {
      menu: EditorHeaderMenu,
      record: {
        redo: EditorHeaderRecordRedo,
        undo: EditorHeaderRecordUndo,
      },
      stageOperate: {
        move: EditorHeaderStageOperateMove,
        select: EditorHeaderStageOperateSelect,
      },
    },
    leftPanel: {
      file: {
        newFile: EditorLeftPanelFileNewFile,
        newFolder: EditorLeftPanelFileNewFolder,
      },
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
        file: EditorLeftPanelSwitchBarFile,
        image: EditorLeftPanelSwitchBarImage,
        layer: EditorLeftPanelSwitchBarLayer,
        popup: EditorLeftPanelSwitchBarPopup,
        record: EditorLeftPanelSwitchBarRecord,
        toLeft: EditorLeftPanelSwitchBarToLeft,
      },
    },
    node: {
      ellipse: EditorNodeEllipse,
      frame: EditorNodeFrame,
      image: EditorNodeImage,
      line: EditorNodeLine,
      polygon: EditorNodePolygon,
      rect: EditorNodeRect,
      star: EditorNodeStar,
      text: EditorNodeText,
    },
    rightPanel: {
      operate: {
        align: {
          alignCenter: EditorRightPanelOperateAlignAlignCenter,
          alignLeft: EditorRightPanelOperateAlignAlignLeft,
          alignRight: EditorRightPanelOperateAlignAlignRight,
          verticalBottom: EditorRightPanelOperateAlignVerticalBottom,
          verticalCenter: EditorRightPanelOperateAlignVerticalCenter,
          verticalTop: EditorRightPanelOperateAlignVerticalTop,
        },
        fill: {
          none: EditorRightPanelOperateFillNone,
        },
        picker: {
          defaultImage: EditorRightPanelOperatePickerDefaultImage,
        },
      },
    },
    shared: {
      delete: EditorSharedDelete,
      loading: EditorSharedLoading,
      lock: EditorSharedLock,
      minus: EditorSharedMinus,
      unLock: EditorSharedUnLock,
      unVisible: EditorSharedUnVisible,
      visible: EditorSharedVisible,
    },
    widget: {
      numberInput: {
        operateUp: EditorWidgetNumberInputOperateUp,
      },
    },
  },
  favIcon: {
    shiyangyang: FavIconShiyangyang,
  },
}

export default Asset
