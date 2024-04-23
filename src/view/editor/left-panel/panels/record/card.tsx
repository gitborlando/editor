import { observer } from 'mobx-react'
import { FC, useEffect } from 'react'
import ReactJson from 'react-json-view'
import { IUndoRedoRecord } from '~/editor/record'
import { useAutoSignal, useHookSignal } from '~/shared/signal-react'
import { hslBlueColor, hslColor } from '~/shared/utils/color'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'

type IRecordCardComp = {
  record: IUndoRedoRecord
  index: number
  collapsed: boolean
  isAction?: boolean
}

export const RecordCardComp: FC<IRecordCardComp> = observer((props) => {
  const { record, index, isAction } = props
  const collapsed = useAutoSignal(true)
  const { classes } = useStyles({ isAction })

  useHookSignal(collapsed)
  useEffect(() => collapsed.dispatch(props.collapsed), [props.collapsed])

  return (
    <Flex layout='v' className={classes.RecordCard}>
      <Flex layout='h' className='desc'>
        {!isAction && `${index} - `}
        {record.description}
        <IconButton
          size={16}
          rotate={collapsed.value ? 0 : 180}
          style={{ marginLeft: 'auto' }}
          onClick={() => collapsed.dispatch(!collapsed.value)}>
          {Asset.editor.leftPanel.page.collapse}
        </IconButton>
      </Flex>
      <Flex layout='h' className='detail'>
        {typeof record.detail === 'string' ? (
          record.detail
        ) : (
          <ReactJson
            src={mapToObj(record.detail)}
            style={{ fontFamily: 'consolas', fontSize: 12 }}
            indentWidth={2}
            displayDataTypes={false}
            quotesOnKeys={false}
            enableClipboard={false}
            collapsed={collapsed.value}
          />
        )}
      </Flex>
    </Flex>
  )
})

type IRecordCardCompStyle = {} /* & Required<
  Pick<IRecordCardComp>
> */ & Pick<IRecordCardComp, 'isAction'>

const useStyles = makeStyles<IRecordCardCompStyle>()((t, { isAction }) => ({
  RecordCard: {
    ...t.rect('100%', 'fit-content'),
    paddingInline: 10,
    paddingBlock: 4,
    '&.active': {
      ...t.default$.active.background,
    },
    '& .desc': {
      ...t.rect('100%', 24),
      fontSize: 12,
      ...(isAction ? { color: hslColor(217, 40, 60) } : { color: hslBlueColor(50) }),
    },
    '& .detail': {
      ...t.rect('100%', 'fit-content'),
      marginBlock: 6,
      fontFamily: 'consolas',
      fontSize: 12,
    },
  },
}))

RecordCardComp.displayName = 'RecordCardComp'

function mapToObj(obj: Record<string, any>) {
  for (const [k, v] of Object.entries(obj)) {
    if (v instanceof Map) obj[k] = Object.fromEntries(v.entries())
  }
  return obj
}
