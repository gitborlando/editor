import { FC, memo, useCallback } from 'react'
import { xy_new } from '~/editor/math/xy'
import { Record } from '~/editor/record'
import { IStageCreateType, StageCreate } from '~/editor/stage/interact/create'
import { StageInteract } from '~/editor/stage/interact/interact'
import { StageViewport } from '~/editor/stage/viewport'
import { Drag } from '~/global/event/drag'
import { createSetting } from '~/global/setting'
import { useHookSignal } from '~/shared/signal/signal-react'
import { hslBlueColor, hslColor, rgba } from '~/shared/utils/color'
import { XY } from '~/shared/xy'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Divide } from '~/view/ui-utility/widget/divide'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IToolTabComp = {}

export const ToolTabComp: FC<IToolTabComp> = memo(({}) => {
  useHookSignal(StageInteract.currentType)
  useHookSignal(StageViewport.zoom)
  const { classes } = useStyles({ top: StageViewport.bound.value.y })

  const RecordIcons: FC<{}> = useCallback(() => {
    useHookSignal(Record.index)
    return (
      <>
        <Button disabled={!Record.canUndo} onClick={Record.undo}>
          <Icon size={20} fill={Record.canUndo ? '' : '#E6E6E6'}>
            {Asset.editor.header.record.undo}
          </Icon>
        </Button>
        <Button disabled={!Record.canRedo} onClick={Record.redo}>
          <Icon size={20} fill={Record.canRedo ? '' : '#E6E6E6'}>
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
      <Button active={isActive} onClick={() => StageCreate.currentType.dispatch(type)}>
        <Icon size={20} fill={isActive ? hslBlueColor(65) : ''}>
          {Asset.editor.node[type as keyof typeof Asset.editor.node]}
        </Icon>
      </Button>
    )
  }

  const xy = createSetting('Editor.toolTab.xy', xy_new(0, 0))
  useHookSignal(xy)
  const getInitXY = (div: HTMLDivElement) => {
    if (xy.value.x !== 0 && xy.value.y !== 0) return
    const { left, top } = div.getBoundingClientRect()
    xy.value = { x: left, y: top }
  }
  const moveTab = () => {
    const startXY = XY.From(xy.value)
    Drag.onSlide(({ shift }) => {
      xy.dispatch(startXY.plus(shift))
    })
  }
  const setXYStyle = () => {
    if (xy.value.x === 0 && xy.value.y === 0) return {}
    return { left: xy.value.x, top: xy.value.y }
  }

  return (
    <Flex layout='h' className={classes.ToolTab} ref={getInitXY} style={{ ...setXYStyle() }}>
      <Flex className={classes.handler} onMouseDown={moveTab}></Flex>
      <RecordIcons />
      <Divide length={16} />
      {(['select', 'move'] as const).map((type) => (
        <StageOperateIcon key={type} type={type} />
      ))}
      <Divide length={16} />
      {StageCreate.createTypes.map((type) => (
        <CreateShapeIcon key={type} type={type} />
      ))}
      <Divide length={16} />
      <Button style={{ width: 60 }}>{~~((StageViewport.zoom.value || 0) * 100)}%</Button>
      {/* <Button onClick={() => SchemaFile.openFile()}>导入</Button>
      <Button onClick={() => SchemaFile.downloadJsonFile(Schema.getSchema())}>下载</Button> */}
    </Flex>
  )
})

type IToolTabCompStyle = {
  top: number
} /* & Required<Pick<IToolTabComp>> */ /* & Pick<IToolTabComp> */

const useStyles = makeStyles<IToolTabCompStyle>()((t, { top }) => ({
  ToolTab: {
    ...t.rect('fit-content', 44, 8, 'white'),
    ...t.default$.borderBottom,
    ...t.absolute('50%', undefined, undefined, 16),
    ...t.transform({ translateX: '-50%' }),
    ...t.paddingHorizontal(10),
    boxShadow: '0 0 7px -2px ' + rgba(0, 0, 0, 0.2),
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
  handler: {
    ...t.rect(3, '50%', 99, hslColor(217, 20, 90)),
    ...t.marginRight(8),
    ...t.cursor('pointer'),
  },
}))

ToolTabComp.displayName = 'ToolTabComp'
