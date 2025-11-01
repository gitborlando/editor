import Scrollbars from 'react-custom-scrollbars-2'
import { IPage } from 'src/editor/schema/type'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { Drag } from 'src/global/event/drag'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { EditorLPLayerState } from 'src/view/editor/left-panel/panels/layer/state'
import { useSnapshot } from 'valtio'
import { PageHeaderComp } from './header'
import { PageItemComp } from './item'

export const PageComp: FC<{}> = observer(({}) => {
  const { pagePanelHeight } = EditorLPLayerState
  const { allPageExpanded } = UILeftPanelLayer
  useHookSignal(allPageExpanded)
  const { meta } = useSnapshot(YState.state)

  return (
    <G vertical className={cls()}>
      <PageHeaderComp />
      <G
        vertical
        className={cls('content')}
        x-if={allPageExpanded.value}
        style={{ height: pagePanelHeight - 37 }}>
        <Scrollbars style={{ height: pagePanelHeight - 37 }}>
          {meta.pageIds.map((id) => {
            const page = YState.findSnap<IPage>(id)
            return <PageItemComp key={page.id} name={page.name} id={page.id} />
          })}
        </Scrollbars>
      </G>
      <G
        className={cls('resize')}
        x-if={allPageExpanded.value}
        onMouseDown={() => {
          let lastHeight = pagePanelHeight
          Drag.onSlide(({ shift }) => {
            let newHeight = lastHeight + shift.y
            if (newHeight <= 69 || newHeight >= 800) return
            EditorLPLayerState.pagePanelHeight = newHeight
          })
        }}></G>
    </G>
  )
})

const cls = classes(css`
  width: 240px;
  height: 100%;
  ${styles.borderBottom}
  &-content {
    overflow-y: auto;
    align-content: start;
  }
  &-resize {
    cursor: ns-resize;
  }
`)
