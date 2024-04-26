import { FC, memo, useCallback } from 'react'
import { SchemaHistory } from '~/editor/schema/history'
import { Schema } from '~/editor/schema/schema'
import { IStageCreateType, StageCreate } from '~/editor/stage/interact/create'
import { StageInteract } from '~/editor/stage/interact/interact'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal } from '~/shared/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import { useSubComponent } from '~/shared/utils/normal'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Divide } from '~/view/ui-utility/widget/divide'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = memo(({}) => {
  useHookSignal(StageInteract.currentType)
  useHookSignal(StageViewport.zoom)
  const { classes, theme, css } = useStyles({ top: StageViewport.bound.value.y })

  const ClientComp = useSubComponent([], ({}) => {
    return (
      <Flex
        className={css({
          ...theme.labelFont,
        })}>
        {Schema.client.id}
      </Flex>
    )
  })

  const RecordIcons: FC<{}> = useCallback(() => {
    useHookSignal(SchemaHistory.index)
    return (
      <>
        <Button disabled={!SchemaHistory.canUndo} onClick={SchemaHistory.undo}>
          <Icon size={20} fill={SchemaHistory.canUndo ? '' : '#E6E6E6'}>
            {Asset.editor.header.record.undo}
          </Icon>
        </Button>
        <Button disabled={!SchemaHistory.canRedo} onClick={SchemaHistory.redo}>
          <Icon size={20} fill={SchemaHistory.canRedo ? '' : '#E6E6E6'}>
            {Asset.editor.header.record.redo}
          </Icon>
        </Button>
      </>
    )
  }, [])

  const StageOperateIcon: FC<{ type: 'select' | 'move' }> = ({ type }) => {
    const isActive = StageInteract.currentType.value === type
    return (
      <Button active={isActive} onClick={() => StageInteract.currentType.dispatch(type)}>
        <Icon size={20} fill={isActive ? hslBlueColor(65) : ''}>
          {Asset.editor.header.stageOperate[type]}
        </Icon>
      </Button>
    )
  }

  const CreateShapeIcon: FC<{ type: IStageCreateType }> = ({ type }) => {
    const isActive =
      StageInteract.currentType.value === 'create' && StageCreate.currentType.value === type
    return (
      <Button
        active={isActive}
        onClick={(e) => {
          StageInteract.currentType.dispatch('create')
          StageCreate.currentType.dispatch(type)
          // e.stopPropagation()
        }}>
        <Icon size={20} fill={isActive ? hslBlueColor(65) : ''}>
          {Asset.editor.node[type as keyof typeof Asset.editor.node]}
        </Icon>
      </Button>
    )
  }

  return (
    <Flex layout='h' className={classes.Header}>
      <Flex layout='h' className={classes.leftGroup}>
        <Flex layout='c'>
          <Icon size={28}>{Asset.favIcon.shiyangyang}</Icon>
          <h4 style={{ color: hslBlueColor(60), fontSize: 16 }}>屎羊羊编辑器</h4>
          {'/'}
          <ClientComp />
        </Flex>
      </Flex>
      <Flex layout='c' className={classes.centerGroup}>
        <RecordIcons />
        <Divide length={16} thickness={0.5} />
        {(['select', 'move'] as const).map((type) => (
          <StageOperateIcon key={type} type={type} />
        ))}
        <Divide length={16} thickness={0.5} />
        {StageCreate.createTypes.map((type) => (
          <CreateShapeIcon key={type} type={type} />
        ))}
        <Divide length={16} thickness={0.5} />
        <Button style={{ width: 60 }}>{~~((StageViewport.zoom.value || 0) * 100)}%</Button>
      </Flex>
    </Flex>
  )
})

type IHeaderCompStyle = {
  top: number
} /* & Required<Pick<IHeaderComp>> */ /* & Pick<IHeaderComp> */

const useStyles = makeStyles<IHeaderCompStyle>()((t, { top }) => ({
  Header: {
    ...t.rect('100%', top),
    ...t.default$.borderBottom,
    ...t.relative(),
  },
  leftGroup: {
    marginLeft: 10,
    gap: 8,
  },
  centerGroup: {
    ...t.absolute(0, 0, 0, 0),
    margin: 'auto',
  },
  fileSave: {
    ...t.labelFont,
  },
}))

HeaderComp.displayName = 'HeaderComp'
