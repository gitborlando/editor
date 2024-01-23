import { observer } from 'mobx-react'
import { FC } from 'react'
import ReactJson from 'react-json-view'
import { IUndoRedoRecord } from '~/editor/record'
import { hslBlueColor, hslColor } from '~/shared/utils/color'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IRecordCardComp = {
  record: IUndoRedoRecord
  index: number
  collapsed: boolean
  isAction?: boolean
}

export const RecordCardComp: FC<IRecordCardComp> = observer(
  ({ record, index, collapsed, isAction }) => {
    const { classes } = useStyles({ isAction })
    return (
      <Flex layout='v' className={classes.RecordCard}>
        <Flex layout='h' className='desc'>
          {!isAction && `${index} - `}
          {record.description}
        </Flex>
        <Flex layout='h' className='detail'>
          {typeof record.detail === 'string' ? (
            record.detail
          ) : (
            <ReactJson
              src={record.detail}
              style={{ fontFamily: 'consolas', fontSize: 12 }}
              indentWidth={2}
              displayDataTypes={false}
              quotesOnKeys={false}
              enableClipboard={false}
              collapsed={collapsed}
            />
          )}
        </Flex>
      </Flex>
    )
  }
)

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
