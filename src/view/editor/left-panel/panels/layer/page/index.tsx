import Scrollbars from 'react-custom-scrollbars-2'
import { IPage } from 'src/editor/schema/type'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { Drag } from 'src/global/event/drag'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMatchPatch } from 'src/shared/utils/react'
import { useSnapshot } from 'valtio'
import { PageHeaderComp } from './header'
import { PageItemComp } from './item'

export const PageComp: FC<{}> = observer(({}) => {
  const { allPageExpanded, pagePanelHeight } = UILeftPanelLayer
  useHookSignal(pagePanelHeight)
  useHookSignal(allPageExpanded)
  useMatchPatch(`/meta/pageIds/...`)
  const { meta } = useSnapshot(YState.state)

  return (
    <G vertical className={cls()}>
      <PageHeaderComp />
      <G
        vertical
        className={cls('content')}
        x-if={allPageExpanded.value}
        style={{ height: pagePanelHeight.value - 37 }}>
        <Scrollbars style={{ height: pagePanelHeight.value - 37 }}>
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
          let lastHeight = pagePanelHeight.value
          Drag.onSlide(({ shift }) => {
            let newHeight = lastHeight + shift.y
            if (newHeight <= 69 || newHeight >= 800) return
            pagePanelHeight.dispatch(newHeight)
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
