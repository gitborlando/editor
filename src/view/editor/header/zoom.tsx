import { Menu as ArcoMenu } from '@arco-design/web-react'
import { RefInputType } from '@arco-design/web-react/es/Input'
import { ChevronDown } from 'lucide-react'
import { Popover } from 'react-tiny-popover'
import { getZoom, StageViewport } from 'src/editor/stage/viewport'
import { InputNumber } from 'src/view/component/arco/input-number'
import { CommonSpaceBetweenItem } from 'src/view/component/item'
import { PopoverCard } from 'src/view/component/popover-card'

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
      <G vertical center className={cls('panel')} gap={8}>
        <InputZoomComp />
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

  return (
    <ArcoMenu className={cls('options')}>
      <ArcoMenu.Item key='100%'>
        <CommonSpaceBetweenItem
          label={t('zoom to 100%')}
          onClick={() => updateZoom(1)}
        />
      </ArcoMenu.Item>
    </ArcoMenu>
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
    ${styles.divideY}
    row-gap: 8px;
    & .arco-menu-inner {
      padding: 0;
    }
    & .arco-menu-item {
      padding: 0px;
    }
  }
`)
