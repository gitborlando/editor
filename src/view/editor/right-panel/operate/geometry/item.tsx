import { FC, useRef } from 'react'
import { max } from '~/editor/math/base'
import { IGeometry, OperateGeometry } from '~/editor/operate/geometry'
import { OperateNode } from '~/editor/operate/node'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal, useSignal } from '~/shared/signal/signal-react'
import { useDownUpTracker } from '~/shared/utils/down-up-tracker'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'

type IGeometryItemComp = {
  label: string
  operateKey: keyof IGeometry
}

export const GeometryItemComp: FC<IGeometryItemComp> = ({ label, operateKey }) => {
  const { geometry, geometryKeyValue, setGeometry } = OperateGeometry
  const ref = useRef<HTMLDivElement>(null)
  const operateDataCache = useSignal(0)
  const slideRate = 1 / StageViewport.zoom.value

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
    if (value === 'multi') return value
    if (Number.isInteger(value)) {
      return value.toString()
    } else {
      return value.toFixed(2)
    }
  }

  return (
    <CompositeInput
      ref={ref}
      label={label}
      value={formatNumber(produceValue())}
      onNewValueApply={(v) => setGeometry(operateKey, produceValue(Number(v)) as number)}
      slideRate={slideRate}
    />
  )
}

GeometryItemComp.displayName = 'SchemaGeometryPropComp'
