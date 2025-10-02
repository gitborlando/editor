import { Flex, Icon } from '@gitborlando/widget'
import cx from 'classix'
import { FC, memo, useCallback } from 'react'
import { SchemaHistory } from 'src/editor/schema/history'
import { IStageCreateType, StageCreate } from 'src/editor/stage/interact/create'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageViewport } from 'src/editor/stage/viewport'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp } from 'src/shared/utils/react'
import { Assets } from 'src/view/assets/assets'
import { Button } from 'src/view/ui-utility/widget/button'
import { Divide } from 'src/view/ui-utility/widget/divide'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = memo(({}) => {
  useHookSignal(StageInteract.currentType)

  const FavIconComp = useMemoComp([], ({}) => {
    return (
      <Flex className='lay-h ml-10 gap-8-8'>
        <Flex className='lay-h'>
          <img src={Assets.favIcon.shiyangyang} className='wh-28' />
          <h4 className='text-hsl60 text-16 ml-10'>Young 编辑器</h4>
        </Flex>
      </Flex>
    )
  })

  const RecordIcons: FC<{}> = useCallback(() => {
    useHookSignal(SchemaHistory.index$)
    return (
      <>
        <Button disabled={!SchemaHistory.canUndo} onClick={SchemaHistory.undo}>
          <Icon
            url={Assets.editor.header.record.undo}
            className={cx('wh-20', !SchemaHistory.canUndo && 'text-#E6E6E6')}
          />
        </Button>
        <Button disabled={!SchemaHistory.canRedo} onClick={SchemaHistory.redo}>
          <Icon
            url={Assets.editor.header.record.redo}
            className={cx('wh-20', !SchemaHistory.canRedo && 'text-#E6E6E6')}
          />
        </Button>
      </>
    )
  }, [])

  const StageOperateIcon: FC<{ type: 'select' | 'move' }> = ({ type }) => {
    const isActive = StageInteract.currentType.value === type
    return (
      <Button active={isActive} onClick={() => StageInteract.currentType.dispatch(type)}>
        <Icon
          className={cx('wh-20', isActive ? 'path-fill-hsl60' : '')}
          url={Assets.editor.header.stageOperate[type]}
        />
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
        }}>
        <Icon
          className={cx('wh-20', isActive ? 'path-fill-hsl60' : '')}
          url={Assets.editor.node[type as keyof typeof Assets.editor.node]}
        />
      </Button>
    )
  }

  const ZoomComp = useMemoComp([], ({}) => {
    useHookSignal(StageViewport.zoom$)
    return <Button style={{ width: 60 }}>{~~((StageViewport.zoom$.value || 0) * 100)}%</Button>
  })

  const navigate = useNavigate()

  return (
    <Flex
      className='lay-h w-100% borderBottom relative bg-white'
      style={{ height: StageViewport.bound.value.y }}>
      <FavIconComp />
      <Button onClick={() => navigate('/')}>文件列表</Button>
      <Flex className='lay-c w-fit m-auto'>
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
        <ZoomComp />
      </Flex>
      <Flex className='lay-h mr-10 ml-auto gap-8-8'></Flex>
    </Flex>
  )
})
