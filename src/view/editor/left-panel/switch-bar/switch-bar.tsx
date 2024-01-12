import { observer } from 'mobx-react'
import { FC } from 'react'
import Asset from '~/assets'
import { UILeftPanel } from '~/editor/ui-state/left-panel/left-panel'
import { useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type ISwitchBarComp = {}

export const SwitchBarComp: FC<ISwitchBarComp> = observer(({}) => {
  const { switchBarPosition, switchBarSize, switchTag } = UILeftPanel
  const { classes, cx } = useStyles({ size: switchBarSize.value })
  useHookSignal(switchBarPosition)
  useHookSignal(switchTag)
  return (
    <Flex
      layout={switchBarPosition.value === 'top' ? 'h' : 'v'}
      sidePadding={switchBarPosition.value === 'top' ? 4 : 8}
      className={cx(
        classes.SwitchBar,
        switchBarPosition.value === 'top' && classes.top,
        switchBarPosition.value === 'left' && classes.left
      )}>
      <Flex layout={switchBarPosition.value === 'top' ? 'h' : 'v'} className={cx('group')}>
        <Button
          className='button'
          active={switchTag.value === 'layer'}
          onClick={() => switchTag.dispatch('layer')}>
          <h4>图层</h4>
        </Button>
        <Button
          className='button'
          active={switchTag.value === 'component'}
          onClick={() => switchTag.dispatch('component')}>
          <h4>组件</h4>
        </Button>
        <Button
          className='button'
          active={switchTag.value === 'source'}
          onClick={() => switchTag.dispatch('source')}>
          <h4>资源</h4>
        </Button>
      </Flex>
      <Button
        type='icon'
        style={{
          ...(switchBarPosition.value === 'top' ? { marginLeft: 'auto' } : { marginTop: 'auto' }),
        }}
        onClick={() =>
          switchBarPosition.dispatch(switchBarPosition.value === 'left' ? 'top' : 'left')
        }>
        <Icon size={16}>{Asset.editor.leftPanel.switchBar.toLeft}</Icon>
      </Button>
    </Flex>
  )
})

type ISwitchBarCompStyle = {
  size: number
} /* & Required<Pick<ISwitchBarComp>> */ /* & Pick<ISwitchBarComp> */

const useStyles = makeStyles<ISwitchBarCompStyle>()((t, { size }) => ({
  SwitchBar: {
    backgroundColor: 'white',
    '& .button': {
      //borderRadius: 2,
    },
  },
  top: {
    ...t.rect('100%', size, 'no-radius', 'white'),
    ...t.default$.border('bottom'),
    '& .group': {
      gap: 8,
    },
  },
  left: {
    ...t.rect(size, '100%', 'no-radius', 'white'),
    ...t.default$.border('right'),
    '& .group': {
      gap: 16,
    },
  },
}))

SwitchBarComp.displayName = 'SwitchBarComp'
