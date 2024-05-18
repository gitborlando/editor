import { FC, memo, useEffect, useMemo, useRef, useState } from 'react'
import ReactJson from 'react-json-view'
import { SchemaHistory } from '~/editor/schema/history'
import { ISchemaHistory, ISchemaOperation } from '~/editor/schema/type'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { hslColor } from '~/shared/utils/color'
import { useMemoComp } from '~/shared/utils/react'
import Asset from '~/view/ui-utility/assets'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'

type IHistoryComp = {}

export const HistoryComp: FC<IHistoryComp> = memo(({}) => {
  const { stack, index } = SchemaHistory
  useHookSignal(index)

  const CardComp = useMemoComp<{
    history: ISchemaHistory
    active: boolean
  }>([], ({ active, history }) => {
    const randomColor = useMemo(() => hslColor(Math.random() * 360, 80, 35), [])
    const ref = useRef<HTMLDivElement>(null)
    const collapsed = useAutoSignal(true)
    const { operations, description } = history
    const needCollapsedItems = operations.length > 6
    const [itemCollapsed, setItemCollapsed] = useState(needCollapsedItems)
    useEffect(() => {
      if (active) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [active])

    return (
      <Flex ref={ref} className={`lay-v wh-100%-fit borderBottom ${active && 'bg-hslb98'}`}>
        <Flex style={{ color: randomColor }} className={`lay-h wh-100%-24 font-size-17 px-10 mt-8`}>
          <h6 className={`w-100% nowrap of-hidden text-ellipsis`}>{description}</h6>
          <IconButton
            size={16}
            rotate={collapsed.value ? 0 : 180}
            style={{ marginLeft: 'auto' }}
            onClick={() => collapsed.dispatch(!collapsed.value)}>
            {Asset.editor.leftPanel.page.collapse}
          </IconButton>
        </Flex>
        {operations.slice(0, itemCollapsed ? 6 : operations.length).map((operation, i) => (
          <OperateDiffComp
            key={(operation.description || '') + i}
            operation={operation}
            collapsed={collapsed.value}
          />
        ))}
        {needCollapsedItems && (
          <Flex className={'lay-h w-100% px-10'}>
            <Flex
              className='ml-auto labelFont pointer mb-8'
              onClick={() => setItemCollapsed(!itemCollapsed)}>
              {itemCollapsed ? '展开' : '折叠'}其余项
            </Flex>
          </Flex>
        )}
      </Flex>
    )
  })

  const OperateDiffComp = useMemoComp<{ operation: ISchemaOperation; collapsed: boolean }>(
    [],
    ({ operation, collapsed }) => {
      const { patches } = operation
      return (
        <Flex className='lay-v wh-100%-fit px-10 py-4'>
          <Flex className='lay-h wh-100%-fit my-6'>
            <ReactJson
              src={patches}
              style={{ fontFamily: 'consolas', fontSize: 12 }}
              indentWidth={2}
              displayDataTypes={false}
              quotesOnKeys={false}
              enableClipboard={false}
              collapsed={collapsed}
            />
          </Flex>
        </Flex>
      )
    }
  )

  return (
    <Flex className='lay-v wh-100%-100% d-scroll of-y-auto'>
      {stack.map((history, i) => (
        <CardComp active={i === index.value} history={history} key={i} />
      ))}
    </Flex>
  )
})
