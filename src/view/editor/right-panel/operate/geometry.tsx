import { Flex } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { floor, max, min } from 'src/editor/math/base'
import { IGeometry, OperateGeometry } from 'src/editor/operate/geometry'
import { OperateNode } from 'src/editor/operate/node'
import { getZoom } from 'src/editor/stage/viewport'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp } from 'src/shared/utils/react'
import { CompositeInput } from 'src/view/ui-utility/widget/compositeInput'

type IGeometryPropsComp = {}

export const GeometryComp: FC<IGeometryPropsComp> = memo(({}) => {
  const { geometryKeys } = OperateGeometry
  const { selectedNodes } = OperateNode
  useHookSignal(selectedNodes, { after: 'geometryKeyValue' })

  const GeometryItemComp = useMemoComp<{
    label: string
    operateKey: keyof IGeometry
    slideRate?: number
  }>([], ({ label, operateKey, slideRate }) => {
    const { geometryKeyValue, setGeometry } = OperateGeometry
    const { selectedNodes } = OperateNode

    slideRate = slideRate ?? 1

    useHookSignal(selectedNodes, { after: 'geometryKeyValue' })

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
        const value = geometryKeyValue.get(operateKey)
        if (value === 'multi') return value
        return value - datum
      }
      return geometryKeyValue.get(operateKey)
    }

    const formatNumber = (value: number | 'multi'): string => {
      if (value === undefined) console.log(operateKey)
      if (value === 'multi') return value
      return value?.toFixed(Number.isInteger(value) ? 0 : 2)
    }

    return (
      <CompositeInput
        className='d-hover-bg px-6 w-100'
        label={label}
        value={formatNumber(produceValue())}
        onNewValueApply={(v) => setGeometry(operateKey, produceValue(Number(v)) as number)}
        slideRate={slideRate}
      />
    )
  })

  return (
    selectedNodes.value.length !== 0 && (
      <Flex layout='h' className='flex-wrap gap-4-20 p-8 borderBottom'>
        <GeometryItemComp label='横坐标' operateKey='x' slideRate={1 / getZoom()} />
        <GeometryItemComp label='纵坐标' operateKey='y' slideRate={1 / getZoom()} />
        <GeometryItemComp label='宽度' operateKey='width' />
        <GeometryItemComp label='高度' operateKey='height' />
        <GeometryItemComp label='旋转' operateKey='rotation' />
        {geometryKeys.has('radius') && <GeometryItemComp label='圆角' operateKey='radius' />}
        {geometryKeys.has('sides') && (
          <GeometryItemComp label='边数' operateKey='sides' slideRate={0.01} />
        )}
        {geometryKeys.has('pointCount') && (
          <GeometryItemComp label='角数' operateKey='pointCount' slideRate={0.01} />
        )}
        {geometryKeys.has('startAngle') && (
          <GeometryItemComp label='起始角' operateKey='startAngle' />
        )}
        {geometryKeys.has('endAngle') && <GeometryItemComp label='结束角' operateKey='endAngle' />}
        {geometryKeys.has('innerRate') && (
          <GeometryItemComp label='内径比' operateKey='innerRate' slideRate={0.01} />
        )}
      </Flex>
    )
  )
})
