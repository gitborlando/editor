import { FC, memo, useEffect, useMemo, useRef } from 'react'
import ReactJson from 'react-json-view'
import { IOperateDiff } from '~/editor/schema/diff'
import { SchemaHistory } from '~/editor/schema/history'
import { ISchemaHistory } from '~/editor/schema/type'
import { useAutoSignal, useHookSignal } from '~/shared/signal-react'
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

  const OperateDiffComp = useSubComponent<{ operateDiff: IOperateDiff }>([], ({ operateDiff }) => {
    const { description, patches, inversePatches } = operateDiff
    const collapsed = useAutoSignal(true)
    return (
      <Flex layout='v' className={classes.diff}>
        <Flex layout='h' className={css({ ...t.rect('100%', 24) })}>
          <Flex
            layout='h'
            className={css({
              ...t.default$.description,
              ...t.default$.font.label,
              marginRight: 10,
            })}>
            {description}
          </Flex>
          <IconButton
            size={16}
            rotate={collapsed.value ? 0 : 180}
            style={{ marginLeft: 'auto' }}
            onClick={() => collapsed.dispatch(!collapsed.value)}>
            {Asset.editor.leftPanel.page.collapse}
          </IconButton>
        </Flex>
        <Flex layout='h' className='detail'>
          <ReactJson
            src={{ patches, inversePatches }}
            style={{ fontFamily: 'consolas', fontSize: 12 }}
            indentWidth={2}
            displayDataTypes={false}
            quotesOnKeys={false}
            enableClipboard={false}
            collapsed={collapsed.value}
          />
        </Flex>
      </Flex>
    )
  })

  const CardComp = useSubComponent<{ history: ISchemaHistory }>([], ({ history }) => {
    const randomColor = useMemo(() => hslColor(Math.random() * 360, 80, 35), [])
    const ref = useRef<HTMLDivElement>(null)
    const isActive = index.value === stack.indexOf(history)
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
            {history.description}
          </h6>
        </Flex>
        {history.operations.map((operation, i) => (
          <OperateDiffComp operateDiff={operation.diff} key={(operation.description || '') + i} />
        ))}
      </Flex>
    )
  })

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
