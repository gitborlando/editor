import { FC, memo } from 'react'
import ReactJson from 'react-json-view'
import { Diff, IDiff } from '~/editor/diff'
import { useAutoSignal, useHookSignal } from '~/shared/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'

type IDiffComp = {}

export const DiffComp: FC<IDiffComp> = memo(({}) => {
  const { classes } = useStyles({})
  const { allDiffs } = Diff
  const Card: FC<{ description: string; diffs: IDiff[] }> = memo(({ description, diffs }) => {
    const collapsed = useAutoSignal(true)
    return (
      <Flex layout='v' className={classes.diff}>
        <Flex layout='h' className='description'>
          {description}
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
            src={diffs}
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

  useHookSignal(allDiffs)
  return (
    <Flex layout='v' className={classes.Diffs}>
      {allDiffs.value.map(({ description, diffs }, i) => (
        <Card key={description + i} description={description} diffs={diffs} />
      ))}
    </Flex>
  )
})

type IDiffCompStyle = {} /* & Required<Pick<IDiffComp>> */ /* & Pick<IDiffComp> */

const useStyles = makeStyles<IDiffCompStyle>()((t) => ({
  Diffs: {
    ...t.rect('100%', '100%'),
    ...t.default$.scrollBar,
    overflowY: 'auto',
  },
  diff: {
    ...t.rect('100%', 'fit-content'),
    ...t.default$.borderBottom,
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

DiffComp.displayName = 'DiffComp'
