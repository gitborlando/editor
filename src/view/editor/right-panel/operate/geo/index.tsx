import { FC, useMemo } from 'react'
import { floor, max, min } from 'src/editor/math/base'
import { IGeometry, OperateGeometry } from 'src/editor/operate/geometry'
import { OperateNode } from 'src/editor/operate/node'
import { getZoom } from 'src/editor/stage/viewport'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useSelectNodes } from 'src/view/hooks/schema/use-y-state'
import { CompositeInput } from 'src/view/ui-utility/widget/compositeInput'
import './index.less'

interface EditorRightOperateGeoProps {}

export const EditorRightOperateGeo: FC<EditorRightOperateGeoProps> = observer(({}) => {
  const selectIds = useHookSignal(OperateNode.selectIds)
  return (
    selectIds.size > 0 && (
      <G className='editor-right-operate-geo borderBottom' horizontal='auto auto'>
        <GeometryItemComp label='横坐标' operateKey='x' slideRate={1 / getZoom()} />
        <GeometryItemComp label='纵坐标' operateKey='y' slideRate={1 / getZoom()} />
        <GeometryItemComp label='宽度' operateKey='width' />
        <GeometryItemComp label='高度' operateKey='height' />
        <GeometryItemComp label='旋转' operateKey='rotation' />
      </G>
    )
  )
})

const GeometryItemComp: FC<{
  label: string
  operateKey: keyof IGeometry
  slideRate?: number
}> = ({ label, operateKey, slideRate }) => {
  const { setGeometry } = OperateGeometry
  const selectedNodes = useSelectNodes()
  // const selectIds = useHookSignal(OperateNode.selectIds)
  // const { selectedNodes } = OperateNode

  slideRate = slideRate ?? 1

  // useHookSignal(selectedNodes, { after: 'geometryKeyValue' })

  const value = useMemo(() => {
    const nodes = selectedNodes //[...selectIds].map((id) => state[id])
    let value = t<any>(nodes[0])[operateKey]
    for (const node of nodes) {
      if (t<any>(node)[operateKey] === value) continue
      value = 'multi'
      break
    }
    return value
  }, [selectedNodes, operateKey])

  const produceValue = (newValue?: number) => {
    if (newValue !== undefined) {
      if (operateKey === 'x') {
        const datum = OperateNode.datumXY.x
        return newValue + datum
      }
      if (operateKey === 'y') {
        const datum = OperateNode.datumXY.y
        return newValue + datum
      }
      if (['width', 'height', 'radius'].includes(operateKey)) {
        return max(0, newValue)
      }
      if (['rotation', 'startAngle', 'endAngle'].includes(operateKey)) {
        return newValue % 360
      }
      if (['sides', 'pointCount'].includes(operateKey)) {
        return max(3, floor(newValue))
      }
      if (['innerRate'].includes(operateKey)) {
        return min(1, max(0, newValue))
      }
      return newValue
    }

    if (operateKey === 'x' || operateKey === 'y') {
      const datum = OperateNode.datumXY[operateKey]
      if (value === 'multi') return value
      return value - datum
    }
    return value
  }

  const formatNumber = (value: number | 'multi'): string => {
    if (value === undefined) console.log(operateKey)
    if (value === 'multi') return value
    return value?.toFixed(Number.isInteger(value) ? 0 : 2)
  }

  return (
    <CompositeInput
      className='d-hover-bg px-6 w-100 h-24'
      label={label}
      value={formatNumber(produceValue())}
      onNewValueApply={(v) => setGeometry(operateKey, produceValue(Number(v)) as number)}
      slideRate={slideRate}
    />
  )
}
