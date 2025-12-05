import { Menu as ArcoMenu } from '@arco-design/web-react'
import { RefInputType } from '@arco-design/web-react/es/Input'
import { Check, ChevronDown } from 'lucide-react'
import { Popover } from 'react-tiny-popover'
import { getEditorSetting } from 'src/editor/editor/setting'
import { getZoom, StageViewport } from 'src/editor/stage/viewport'
import { Divider } from 'src/view/component/arco/divider'
import { InputNumber } from 'src/view/component/arco/input-number'
import { MenuItem } from 'src/view/component/arco/menu'
import { BalanceItem } from 'src/view/component/item'
import { PopoverCard } from 'src/view/component/popover-card'
import { Text } from 'src/view/component/text'

export const EditorHeaderZoomComp: FC<{}> = observer(({}) => {
  const zoom = ~~((getZoom() || 0) * 100)
  const [show, setShow] = useState(false)

  return (
    <Popover
      isOpen={show}
      positions={['bottom']}
      onClickOutside={() => setShow(false)}
      content={<PanelComp />}>
      <G center horizontal className={cls()} onClick={() => setShow(!show)}>
        <G>{zoom}%</G>
        <Lucide icon={ChevronDown} size={16} />
      </G>
    </Popover>
  )
})

const PanelComp: FC<{}> = observer(({}) => {
  return (
    <PopoverCard style={{ padding: 6 }}>
      <G vertical center className={cls('panel')}>
        <InputZoomComp />
        <Divider style={{ margin: '6px 0' }} />
        <ZoomingOptionsComp />
      </G>
    </PopoverCard>
  )
})

const InputZoomComp: FC<{}> = observer(({}) => {
  const { updateZoom } = StageViewport

  const zoom = ~~((getZoom() || 0) * 100)
  const ref = useRef<RefInputType>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <InputNumber
      style={{ width: 160 }}
      hideControl={false}
      ref={ref}
      value={zoom}
      onChange={(value) => updateZoom((value || 0) / 100)}
      suffix='%'
    />
  )
})

const ZoomingOptionsComp: FC<{}> = observer(({}) => {
  const { updateZoom } = StageViewport

  const handelSaveSceneMatrix = (shouldSave: boolean) => {
    const setting = getEditorSetting()
    setting.dev.fixedSceneMatrix = shouldSave
    if (shouldSave) {
      setting.dev.sceneMatrix = StageViewport.sceneMatrix.tuple()
    }
  }

  return (
    <ArcoMenu className={cls('options')}>
      <MenuItem key='100%'>
        <CheckableBalanceItem
          label={t('zoom to 100')}
          onClick={() => updateZoom(1)}
        />
      </MenuItem>
      <MenuItem key='lock'>
        <CheckableBalanceItem
          label={t('save current zoom and offset')}
          checked={getEditorSetting().dev.fixedSceneMatrix}
          onChecked={handelSaveSceneMatrix}
        />
      </MenuItem>
    </ArcoMenu>
  )
})

const CheckableBalanceItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<'div'> & {
    label: string
    checked?: boolean
    onChecked?: (value: boolean) => void
  }
>(({ className, label, checked, onChecked, onClick, children, ...rest }, ref) => {
  const cls = classes(css`
    padding-inline: 4px 20px;
    &-checked {
      color: var(--color);
    }
  `)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    onChecked?.(!checked)
  }

  return (
    <BalanceItem
      className={cx(cls(), className)}
      {...rest}
      ref={ref}
      left={
        <G horizontal='auto 1fr' center gap={2}>
          {onChecked && checked ? (
            <Lucide icon={Check} size={16} className={cls('checked')} />
          ) : (
            <G style={{ width: 16 }} />
          )}
          <Text>{label}</Text>
        </G>
      }
      right={children}
      onClick={handleClick}
    />
  )
})

const cls = classes(css`
  width: fit-content;
  height: 32px;
  padding: 8px;
  cursor: pointer;
  ${styles.bgHoverGray}
  ${styles.borderRadius}
  ${styles.textCommon}
  &-panel {
    & .arco-menu-inner {
      padding: 0;
    }
    & .arco-menu-item {
      padding: 0px;
    }
  }
`)
