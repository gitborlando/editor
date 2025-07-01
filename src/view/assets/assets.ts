// 自动生成的静态资源路径常量
import editorCursorResize from './editor/cursor/resize.svg';
import editorCursorSelect from './editor/cursor/select.svg';
import editorHeaderMenu from './editor/header/menu.svg';
import editorHeaderRecordRedo from './editor/header/record/redo.svg';
import editorHeaderRecordUndo from './editor/header/record/undo.svg';
import editorHeaderStageOperateMove from './editor/header/stage-operate/move.svg';
import editorHeaderStageOperateSelect from './editor/header/stage-operate/select.svg';
import editorLeftPanelFileNewFile from './editor/left-panel/file/new-file.svg';
import editorLeftPanelFileNewFolder from './editor/left-panel/file/new-folder.svg';
import editorLeftPanelNodeCollapse from './editor/left-panel/node/collapse.svg';
import editorLeftPanelPageAdd from './editor/left-panel/page/add.svg';
import editorLeftPanelPageCollapse from './editor/left-panel/page/collapse.svg';
import editorLeftPanelPagePageSelect from './editor/left-panel/page/page-select.svg';
import editorLeftPanelSwitchBarComponent from './editor/left-panel/switch-bar/component.svg';
import editorLeftPanelSwitchBarFile from './editor/left-panel/switch-bar/file.svg';
import editorLeftPanelSwitchBarImage from './editor/left-panel/switch-bar/image.svg';
import editorLeftPanelSwitchBarLayer from './editor/left-panel/switch-bar/layer.svg';
import editorLeftPanelSwitchBarPopup from './editor/left-panel/switch-bar/popup.svg';
import editorLeftPanelSwitchBarRecord from './editor/left-panel/switch-bar/record.svg';
import editorLeftPanelSwitchBarToLeft from './editor/left-panel/switch-bar/to-left.svg';
import editorNodeEllipse from './editor/node/ellipse.svg';
import editorNodeFrame from './editor/node/frame.svg';
import editorNodeImage from './editor/node/image.svg';
import editorNodeLine from './editor/node/line.svg';
import editorNodePolygon from './editor/node/polygon.svg';
import editorNodeRect from './editor/node/rect.svg';
import editorNodeStar from './editor/node/star.svg';
import editorNodeText from './editor/node/text.svg';
import editorRightPanelOperateAlignAlignCenter from './editor/right-panel/operate/align/align-center.svg';
import editorRightPanelOperateAlignAlignLeft from './editor/right-panel/operate/align/align-left.svg';
import editorRightPanelOperateAlignAlignRight from './editor/right-panel/operate/align/align-right.svg';
import editorRightPanelOperateAlignVerticalBottom from './editor/right-panel/operate/align/vertical-bottom.svg';
import editorRightPanelOperateAlignVerticalCenter from './editor/right-panel/operate/align/vertical-center.svg';
import editorRightPanelOperateAlignVerticalTop from './editor/right-panel/operate/align/vertical-top.svg';
import editorSharedDelete from './editor/shared/delete.svg';
import editorSharedLoading from './editor/shared/loading.svg';
import editorSharedLock from './editor/shared/lock.svg';
import editorSharedMinus from './editor/shared/minus.svg';
import editorSharedUnLock from './editor/shared/un-lock.svg';
import editorSharedUnVisible from './editor/shared/un-visible.svg';
import editorSharedVisible from './editor/shared/visible.svg';
import editorWidgetCursor from './editor/widget/cursor.svg';
import editorWidgetNumberInputOperateUp from './editor/widget/number-input/operate-up.svg';
import favIconShiyangyang from './fav-icon/shiyangyang.png';

export const Assets = {
  editor: {
    cursor: {
      resize: editorCursorResize,
      select: editorCursorSelect,
    },
    header: {
      menu: editorHeaderMenu,
      record: {
        redo: editorHeaderRecordRedo,
        undo: editorHeaderRecordUndo,
      },
      stageOperate: {
        move: editorHeaderStageOperateMove,
        select: editorHeaderStageOperateSelect,
      },
    },
    leftPanel: {
      file: {
        newFile: editorLeftPanelFileNewFile,
        newFolder: editorLeftPanelFileNewFolder,
      },
      node: {
        collapse: editorLeftPanelNodeCollapse,
      },
      page: {
        add: editorLeftPanelPageAdd,
        collapse: editorLeftPanelPageCollapse,
        pageSelect: editorLeftPanelPagePageSelect,
      },
      switchBar: {
        component: editorLeftPanelSwitchBarComponent,
        file: editorLeftPanelSwitchBarFile,
        image: editorLeftPanelSwitchBarImage,
        layer: editorLeftPanelSwitchBarLayer,
        popup: editorLeftPanelSwitchBarPopup,
        record: editorLeftPanelSwitchBarRecord,
        toLeft: editorLeftPanelSwitchBarToLeft,
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
    rightPanel: {
      operate: {
        align: {
          alignCenter: editorRightPanelOperateAlignAlignCenter,
          alignLeft: editorRightPanelOperateAlignAlignLeft,
          alignRight: editorRightPanelOperateAlignAlignRight,
          verticalBottom: editorRightPanelOperateAlignVerticalBottom,
          verticalCenter: editorRightPanelOperateAlignVerticalCenter,
          verticalTop: editorRightPanelOperateAlignVerticalTop,
        },
      },
    },
    shared: {
      delete: editorSharedDelete,
      loading: editorSharedLoading,
      lock: editorSharedLock,
      minus: editorSharedMinus,
      unLock: editorSharedUnLock,
      unVisible: editorSharedUnVisible,
      visible: editorSharedVisible,
    },
    widget: {
      cursor: editorWidgetCursor,
      numberInput: {
        operateUp: editorWidgetNumberInputOperateUp,
      },
    },
  },
  favIcon: {
    shiyangyang: favIconShiyangyang,
  },

} as const;
