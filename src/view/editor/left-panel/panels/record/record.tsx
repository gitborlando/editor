import { observer } from 'mobx-react'
import { FC } from 'react'
import { Record } from '~/editor/record'
import { useAutoSignal, useHookSignal } from '~/shared/signal-react'
import { hslBlueColor, hslToRgba, rgbaString } from '~/shared/utils/color'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'
import { RecordCardComp } from './card'

type IRecordComp = {}

export const RecordComp: FC<IRecordComp> = observer(({}) => {
  const { index, stack } = Record
  const allExpanded = useAutoSignal(true)
  const { classes, cx, theme } = useStyles({})
  useHookSignal(index)

  return (
    <Flex layout='v' className={classes.record}>
      <Flex
        layout='h'
        className={classes.head}
        sidePadding={4}
        style={{ ...theme.default$.borderBottom }}>
        {index.value >= 0 && (
          <Flex
            layout='c'
            style={{
              ...theme.font(hslBlueColor(50), 12),
              paddingLeft: 6,
            }}>
            {index.value} - {stack[index.value].description}
          </Flex>
        )}
        <Button
          type='icon'
          style={{ marginLeft: 'auto' }}
          onClick={() => allExpanded.dispatch(!allExpanded.value)}>
          <Icon size={16} rotate={allExpanded.value ? 180 : 0}>
            {Asset.editor.leftPanel.page.collapse}
          </Icon>
        </Button>
      </Flex>
      <Flex layout='v' className={cx(classes.recordList, 'scroll')}>
        {Record.stack.map((record, i) => {
          const isActive = index.value === i
          if ('subStack' in record) {
            return (
              <Flex
                layout='v'
                key={record.description + i}
                className={cx(classes.container, isActive && 'active')}>
                <Flex layout='h' className={classes.desc} sidePadding={10}>
                  {i} - {record.description}
                </Flex>
                {record.subStack.map((record, i) => (
                  <RecordCardComp
                    key={record.description + i}
                    record={record}
                    index={i}
                    collapsed={!allExpanded.value}
                    isAction={true}
                  />
                ))}
              </Flex>
            )
          } else {
            return (
              <Flex
                layout='v'
                key={record.description + i}
                className={cx(classes.container, isActive && 'active')}>
                <RecordCardComp record={record} index={i} collapsed={!allExpanded.value} />
              </Flex>
            )
          }
        })}
      </Flex>
    </Flex>
  )
})

type IRecordCompStyle = {} /* & Required<Pick<IRecordComp>> */ /* & Pick<IRecordComp> */

const useStyles = makeStyles<IRecordCompStyle>()((t) => ({
  record: {
    ...t.rect('100%', '100%'),
  },
  head: {
    ...t.rect('100%', 36),
  },
  recordList: {
    ...t.rect('100%', '100%'),
    ...t.default$.scrollBar,
    overflowY: 'auto',
  },
  container: {
    ...t.rect('100%', 'fit-content'),
    ...t.default$.borderBottom,
    '&.active': {
      ...t.default$.active.background,
    },
  },
  desc: {
    ...t.rect('100%', 24),
    fontSize: 12,
    color: hslBlueColor(50),
  },
}))

RecordComp.displayName = 'RecordComp'

function randomColor() {
  return rgbaString(hslToRgba(Math.random() * 360, 100, 97))
}
