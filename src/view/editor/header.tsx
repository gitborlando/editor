import { clone } from '@gitborlando/utils'
import { Icon } from '@gitborlando/widget'
import { ChevronLeft, Redo, Undo } from 'lucide-react'
import { IStageCreateType, StageCreate } from 'src/editor/stage/interact/create'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { getZoom, StageViewport } from 'src/editor/stage/viewport'
import { Button } from 'src/view/component/button'
import { Lucide } from 'src/view/component/lucide'
import { AvatarCircles } from 'src/view/shadcn/ui/avatar-circles'

export const HeaderComp: FC<{}> = observer(({}) => {
  const navigate = useNavigate()

  return (
    <G
      center
      horizontal='auto 1fr auto'
      className={cls()}
      style={{ height: StageViewport.bound.top }}>
      <Button onClick={() => navigate('/')} icon={<Lucide icon={ChevronLeft} />}>
        文件列表
      </Button>
      <G center horizontal gap={0} className={cls('centerGroup')}>
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
      <G center horizontal className={cls('rightGroup')}>
        <CooperationComp />
      </G>
    </G>
  )
})

const StageOperateIcon: FC<{ type: 'select' | 'move' }> = observer(({ type }) => {
  const isActive = StageInteract.interaction === type
  return (
    <Button
      active={isActive}
      icon={
        <Icon
          url={Assets.editor.header.stageOperate[type]}
          className={cls('centerGroup-icon')}
        />
      }
      onClick={() => (StageInteract.interaction = type)}></Button>
  )
})

const CreateShapeIcon: FC<{ type: IStageCreateType }> = observer(({ type }) => {
  const isActive =
    StageInteract.interaction === 'create' && StageCreate.currentType.value === type
  const iconUrl = Assets.editor.node[type as keyof typeof Assets.editor.node]
  return (
    <Button
      active={isActive}
      icon={<Icon url={iconUrl} className={cls('centerGroup-icon')} />}
      onClick={(e) => {
        StageInteract.interaction = 'create'
        StageCreate.currentType.dispatch(type)
      }}></Button>
  )
})

const UndoGroup: FC<{}> = observer(() => {
  return (
    <G horizontal gap={4}>
      <Button
        icon={<Lucide icon={Undo} />}
        disabled={!YUndo.canUndo}
        onClick={YUndo.undo}
      />
      <Button
        icon={<Lucide icon={Redo} />}
        disabled={!YUndo.canRedo}
        onClick={YUndo.redo}
      />
    </G>
  )
})

const ZoomComp = observer(({}) => {
  return <Button style={{ width: 60 }}>{~~((getZoom() || 0) * 100)}%</Button>
})

export const CooperationComp: FC<{}> = observer(({}) => {
  const others = useSnapshot(YClients.others)
  console.log('others: ', clone(others))
  const avatarUrls = Object.values(others).map((other) => ({
    imageUrl: URL.createObjectURL(
      new Blob([other.userAvatar], { type: 'image/svg+xml' }),
    ),
    color: other.color,
  }))
  return (
    <G className={cls('abc')}>
      <AvatarCircles avatarUrls={avatarUrls} numPeople={3} />
    </G>
  )
})

const cls = classes(css`
  padding-inline: 4px;
  border-bottom: 1px solid var(--gray-border);

  &-centerGroup {
    justify-content: center;
    & > *:not(:last-child)::after {
      content: '';
      display: block;
      width: 1px;
      height: 20px;
      background-color: var(--gray-border);
      margin-top: 6px;
      margin-left: 4px;
      margin-right: 8px;
    }
    &-icon {
      width: 20px;
      height: 20px;
    }
  }
`)
