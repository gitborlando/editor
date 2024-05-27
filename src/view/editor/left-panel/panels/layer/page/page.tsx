import { FC, memo } from 'react'
import { Schema } from 'src/editor/schema/schema'
import { IPage } from 'src/editor/schema/type'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { Drag } from 'src/global/event/drag'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMatchPatch } from 'src/shared/utils/react'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { PageHeaderComp } from './header'
import { PageItemComp } from './item'

type IPageComp = {}

export const PageComp: FC<IPageComp> = memo(({}) => {
  const { allPageExpanded, pagePanelHeight } = UILeftPanelLayer
  useHookSignal(pagePanelHeight)
  useHookSignal(allPageExpanded)
  useMatchPatch(`/meta/pageIds`)

  return (
    <Flex className='lay-v shrink-0 wh-100%-fit borderBottom'>
      <PageHeaderComp />
      <Flex
        className='lay-v wh-100% of-overlay d-scroll'
        vshow={allPageExpanded.value}
        style={{ height: pagePanelHeight.value - 37 }}>
        {Schema.meta.pageIds.map((id) => {
          const page = Schema.find<IPage>(id)
          return <PageItemComp key={page.id} name={page.name} id={page.id} />
        })}
      </Flex>
      <Flex
        className='lay-c shrink-0 wh-100%-5 n-resize'
        vshow={allPageExpanded.value}
        onMouseDown={() => {
          let lastHeight = pagePanelHeight.value
          Drag.onSlide(({ shift }) => {
            let newHeight = lastHeight + shift.y
            if (newHeight <= 69 || newHeight >= 800) return
            pagePanelHeight.dispatch(newHeight)
          })
        }}></Flex>
    </Flex>
  )
})
