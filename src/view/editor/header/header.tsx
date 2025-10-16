import { Flex, Icon } from '@gitborlando/widget'
import cx from 'classix'
import { Redo, Undo } from 'lucide-react'
import { FC, memo } from 'react'
import { YUndo } from 'src/editor/schema/y-undo'
import { IStageCreateType, StageCreate } from 'src/editor/stage/interact/create'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageViewport } from 'src/editor/stage/viewport'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp } from 'src/shared/utils/react'
import { Assets } from 'src/view/assets/assets'
import { IconButton } from 'src/view/component/button'
import { Button } from 'src/view/ui-utility/widget/button'
import { Divide } from 'src/view/ui-utility/widget/divide'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = memo(({}) => {
  useHookSignal(StageInteract.currentType)

  const StageOperateIcon: FC<{ type: 'select' | 'move' }> = ({ type }) => {
    const isActive = StageInteract.currentType.value === type
    return (
      <Button active={isActive} onClick={() => StageInteract.currentType.dispatch(type)}>
        <Icon
          className={cx('wh-20', isActive ? 'text-hsl60' : '')}
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
          className={cx('wh-20', isActive ? 'text-hsl60' : '')}
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
      <Button onClick={() => navigate('/')}>文件列表</Button>
      <Flex className='lay-c w-fit m-auto'>
        <UndoGroup />
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

const UndoGroup: FC<{}> = observer(() => {
  return (
    <>
      <IconButton
        icon={<Undo size={20} className='text-#5C5C66' />}
        disabled={!YUndo.canUndo}
        onClick={YUndo.undo}
      />
      <IconButton
        icon={<Redo size={20} className='text-#5C5C66' />}
        disabled={!YUndo.canRedo}
        onClick={YUndo.redo}
      />
    </>
  )
})
