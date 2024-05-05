import { FC, memo, useEffect, useMemo, useRef, useState } from 'react'
import ReactJson from 'react-json-view'
import { SchemaHistory } from '~/editor/schema/history'
import { ISchemaHistory, ISchemaOperation } from '~/editor/schema/type'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { hslBlueColor, hslColor } from '~/shared/utils/color'
import { useSubComponent } from '~/shared/utils/normal'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'

type IHistoryComp = {}

export const HistoryComp: FC<IHistoryComp> = memo(({}) => {
  const { classes, css, theme: t, cx } = useStyles({})
  const { stack, index } = SchemaHistory
  useHookSignal(index)

  const CardComp = useSubComponent<{ history: ISchemaHistory }>([], ({ history }) => {
    const randomColor = useMemo(() => hslColor(Math.random() * 360, 80, 35), [])
    const ref = useRef<HTMLDivElement>(null)
    const isActive = index.value === stack.indexOf(history)
    const collapsed = useAutoSignal(true)
    const { operations, description } = history
    const needCollapsedItems = operations.length > 6
    const [itemCollapsed, setItemCollapsed] = useState(needCollapsedItems)
    useEffect(() => {
      if (isActive) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [isActive])

    return (
      <Flex
        ref={ref}
        layout='v'
        className={css({
          ...t.rect('100%', 'fit-content'),
          ...t.default$.borderBottom,
          ...(isActive && { backgroundColor: hslBlueColor(98) }),
        })}>
        <Flex
          layout='h'
          className={css({
            ...t.rect('100%', 24),
            ...t.font(randomColor),
            paddingInline: 10,
            fontSize: 17,
            marginTop: 8,
          })}>
          <h6
            className={css({
              ...t.default$.description,
            })}>
            {description}
          </h6>
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
          <Flex layout='h' className={css({ width: '100%', paddingInline: 10 })}>
            <Flex
              className={css({
                marginLeft: 'auto',
                ...t.labelFont,
                cursor: 'pointer',
                marginBottom: 8,
              })}
              onClick={() => setItemCollapsed(!itemCollapsed)}>
              {itemCollapsed ? '展开' : '折叠'}其余项
            </Flex>
          </Flex>
        )}
      </Flex>
    )
  })

  const OperateDiffComp = useSubComponent<{ operation: ISchemaOperation; collapsed: boolean }>(
    [],
    ({ operation, collapsed }) => {
      const { patches } = operation
      return (
        <Flex layout='v' className={classes.diff}>
          <Flex layout='h' className='detail'>
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
    <Flex layout='v' className={classes.Diffs}>
      {stack.map((history, i) => (
        <CardComp history={history} key={i} />
      ))}
    </Flex>
  )
})

type IHistoryCompStyle = {} /* & Required<Pick<IHistoryComp>> */ /* & Pick<IHistoryComp> */

const useStyles = makeStyles<IHistoryCompStyle>()((t) => ({
  Diffs: {
    ...t.rect('100%', '100%'),
    ...t.default$.scrollBar,
    overflowY: 'auto',
  },
  diff: {
    ...t.rect('100%', 'fit-content'),
    // ...t.default$.borderBottom,
    paddingInline: 10,
    paddingBlock: 4,
    '& .description': {
      ...t.rect('100%', 24),
      ...t.font(hslBlueColor(50), 12),
    },
    '& .detail': {
      ...t.rect('100%', 'fit-content'),
      marginBlock: 6,
    },
  },
}))

HistoryComp.displayName = 'HistoryComp'
