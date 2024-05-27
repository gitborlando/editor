import { FC, memo, useRef } from 'react'
import { max } from 'src/editor/math/base'
import { IGeometry, OperateGeometry } from 'src/editor/operate/geometry'
import { OperateNode } from 'src/editor/operate/node'
import { StageViewport } from 'src/editor/stage/viewport'
import { useHookSignal, useSignal } from 'src/shared/signal/signal-react'
import { useDownUpTracker } from 'src/shared/utils/event'
import { useMemoComp } from 'src/shared/utils/react'
import { CompositeInput } from 'src/view/ui-utility/widget/compositeInput'
import { Flex } from 'src/view/ui-utility/widget/flex'

type IGeometryPropsComp = {}

export const GeometryComp: FC<IGeometryPropsComp> = memo(({}) => {
  const { geometryKeys } = OperateGeometry
  const { selectedNodes } = OperateNode
  useHookSignal(selectedNodes, { after: 'geometryKeyValue' })

  const GeometryItemComp = useMemoComp<{
    label: string
    operateKey: keyof IGeometry
  }>([], ({ label, operateKey }) => {
    const { geometry, geometryKeyValue, setGeometry } = OperateGeometry
    const ref = useRef<HTMLDivElement>(null)
    const operateDataCache = useSignal(0)
    const slideRate = 1 / StageViewport.zoom.value

    const { selectedNodes } = OperateNode
    useHookSignal(selectedNodes, { after: 'geometryKeyValue' })

    useHookSignal(StageViewport.zoom)
    useDownUpTracker(
      () => ref.current,
      () => {
        operateDataCache.value = geometry[operateKey]
        OperateGeometry.beforeOperate.dispatch([operateKey])
      },
      () => {
        if (operateDataCache.value === geometry[operateKey]) return
        OperateGeometry.afterOperate.dispatch()
      }
    )

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
        if (operateKey === 'rotation') {
          return newValue > 180 ? 180 : newValue < -180 ? -180 : newValue
        }
        if (['sides', 'points'].includes(operateKey)) {
          return max(3, newValue)
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
        ref={ref}
        className='d-hover-bg px-6'
        label={label}
        value={formatNumber(produceValue())}
        onNewValueApply={(v) => setGeometry(operateKey, produceValue(Number(v)) as number)}
        slideRate={slideRate}
      />
    )
  })

  return (
    selectedNodes.value.length !== 0 && (
      <Flex className='lay-h flex-wrap gap-4-4 p-8 borderBottom'>
        <GeometryItemComp label='横坐标' operateKey='x' />
        <GeometryItemComp label='纵坐标' operateKey='y' />
        <GeometryItemComp label='宽度' operateKey='width' />
        <GeometryItemComp label='高度' operateKey='height' />
        <GeometryItemComp label='旋转' operateKey='rotation' />
        {geometryKeys.has('radius') && <GeometryItemComp label='圆角' operateKey='radius' />}
        {geometryKeys.has('sides') && <GeometryItemComp label='边数' operateKey='sides' />}
        {geometryKeys.has('points') && <GeometryItemComp label='角数' operateKey='points' />}
      </Flex>
    )
  )
})
