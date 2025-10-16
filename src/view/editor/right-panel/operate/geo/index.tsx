import { FC, useMemo } from 'react'
import { AllGeometry, OperateGeometry } from 'src/editor/operate/geometry'
import { OperateNode } from 'src/editor/operate/node'
import { getZoom } from 'src/editor/stage/viewport'
import { MULTI_VALUE } from 'src/global/constant'
import { twoDecimal } from 'src/shared/utils/normal'
import { SlideInput } from 'src/view/editor/right-panel/operate/components/slide-input'
import { useSelectNodes } from 'src/view/hooks/schema/use-y-state'
import './index.less'

interface EditorRightOperateGeoProps {}

export const EditorRightOperateGeo: FC<EditorRightOperateGeoProps> = observer(({}) => {
  const { activeKeys, setupActiveKeys, setupActiveGeometry } = OperateGeometry
  const nodes = useSelectNodes()

  useMemo(() => {
    setupActiveKeys(nodes)
    setupActiveGeometry(nodes)
  }, [nodes])

  return (
    <G
      x-if={nodes.length > 0}
      className='editor-right-operate-geo borderBottom'
      horizontal='auto auto'
      gap={8}>
      <GeometryItemComp label='横轴' operateKey='x' slideRate={1 / getZoom()} />
      <GeometryItemComp label='纵轴' operateKey='y' slideRate={1 / getZoom()} />
      <GeometryItemComp label='宽度' operateKey='width' />
      <GeometryItemComp label='高度' operateKey='height' />
      <GeometryItemComp label='旋转' operateKey='rotation' />
      <GeometryItemComp
        x-if={activeKeys.has('radius')}
        label='圆角'
        operateKey='radius'
        slideRate={1 / getZoom()}
      />
      <GeometryItemComp
        x-if={activeKeys.has('sides')}
        label='边数'
        operateKey='sides'
        slideRate={0.01}
      />
      <GeometryItemComp
        x-if={activeKeys.has('pointCount')}
        label='角数'
        operateKey='pointCount'
        slideRate={0.01}
      />
      <GeometryItemComp
        x-if={activeKeys.has('startAngle')}
        label='起始角'
        operateKey='startAngle'
      />
      <GeometryItemComp x-if={activeKeys.has('endAngle')} label='结束角' operateKey='endAngle' />
      <GeometryItemComp
        x-if={activeKeys.has('innerRate')}
        label='内径比'
        operateKey='innerRate'
        slideRate={0.01}
      />
    </G>
  )
})

const GeometryItemComp: FC<{
  label: string
  operateKey: keyof AllGeometry
  slideRate?: number
}> = ({ label, operateKey, slideRate = 1 }) => {
  const { activeGeometry, setActiveGeometry } = OperateGeometry

  const value = activeGeometry[operateKey]
  const isMultiValue = t<any>(value) === MULTI_VALUE

  const inputValue = useRef(0)
  const correctedValue = useMemo(() => {
    if (isMultiValue) return value
    if (operateKey === 'x' || operateKey === 'y') {
      const datum = OperateNode.datumXY[operateKey]
      return value - datum
    }
    return value
  }, [value])
  inputValue.current = correctedValue

  const correctSetValue = (value: number) => {
    value = value === undefined ? 0 : value

    if (operateKey === 'x' || operateKey === 'y') {
      const datum = OperateNode.datumXY[operateKey]
      return value + datum
    }
    if (['rotation', 'startAngle', 'endAngle'].includes(operateKey)) {
      return value % 360
    }
    return value
  }

  const handleOnBlur = () => {
    if (t<any>(inputValue.current) === MULTI_VALUE) return
    setActiveGeometry(operateKey, inputValue.current)
  }

  return (
    <SlideInput
      className='editor-right-operate-geo-input'
      size='small'
      prefix={label}
      value={isMultiValue ? MULTI_VALUE : twoDecimal(correctedValue)}
      slideRate={slideRate}
      onSlide={(v) => setActiveGeometry(operateKey, correctSetValue(v), true)}
      onChange={(v) => (inputValue.current = correctSetValue(v))}
      onBlur={handleOnBlur}
      {...(isMultiValue ? { placeholder: MULTI_VALUE } : {})}
    />
  )
}
