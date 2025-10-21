import { Icon } from '@gitborlando/widget'
import { ChevronLeft, Redo, Undo } from 'lucide-react'
import { FC, memo } from 'react'
import { IStageCreateType, StageCreate } from 'src/editor/stage/interact/create'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageViewport } from 'src/editor/stage/viewport'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { Assets } from 'src/view/assets/assets'
import { Button } from 'src/view/component/button'
import { Lucide } from 'src/view/component/lucide'

import './index.less'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = memo(({}) => {
  useHookSignal(StageInteract.currentType)
  const navigate = useNavigate()

  return (
    <G
      center
      horizontal='auto 1fr auto'
      className='editor-header borderBottom'
      style={{ height: StageViewport.bound.value.y }}>
      <Button onClick={() => navigate('/')} icon={<Lucide icon={ChevronLeft} />}>
        文件列表(1)
      </Button>
      <G center horizontal gap={0} className='editor-header-centerGroup'>
        <UndoGroup />
        <G center gap={4} horizontal>
          <StageOperateIcon type='select' />
          <StageOperateIcon type='move' />
        </G>
        <G center gap={4} horizontal>
          {StageCreate.createTypes.map((type) => (
            <CreateShapeIcon key={type} type={type} />
          ))}
        </G>
        <ZoomComp />
      </G>
      <G center horizontal className='lay-h mr-10 ml-auto gap-8-8'></G>
    </G>
  )
})

const StageOperateIcon: FC<{ type: 'select' | 'move' }> = ({ type }) => {
  const isActive = StageInteract.currentType.value === type
  return (
    <Button
      active={isActive}
      icon={<Icon url={Assets.editor.header.stageOperate[type]} className='wh-20' />}
      onClick={() => StageInteract.currentType.dispatch(type)}></Button>
  )
}

const CreateShapeIcon: FC<{ type: IStageCreateType }> = ({ type }) => {
  const isActive =
    StageInteract.currentType.value === 'create' && StageCreate.currentType.value === type
  const iconUrl = Assets.editor.node[type as keyof typeof Assets.editor.node]
  return (
    <Button
      active={isActive}
      icon={<Icon url={iconUrl} className='wh-20' />}
      onClick={(e) => {
        StageInteract.currentType.dispatch('create')
        StageCreate.currentType.dispatch(type)
      }}></Button>
  )
}

const UndoGroup: FC<{}> = observer(() => {
  return (
    <G horizontal gap={4}>
      <Button icon={<Lucide icon={Undo} />} disabled={!YUndo.canUndo} onClick={YUndo.undo} />
      <Button icon={<Lucide icon={Redo} />} disabled={!YUndo.canRedo} onClick={YUndo.redo} />
    </G>
  )
})

const ZoomComp = ({}) => {
  useHookSignal(StageViewport.zoom$)
  return <Button style={{ width: 60 }}>{~~((StageViewport.zoom$.value || 0) * 100)}%</Button>
}
