import { FC, useRef } from 'react'
import { max } from '~/editor/math/base'
import { IGeometry, OperateGeometry } from '~/editor/operate/geometry'
import { OperateNode } from '~/editor/operate/node'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal, useSignal } from '~/shared/signal/signal-react'
import { useDownUpTracker } from '~/shared/utils/down-up-tracker'
import { makeStyles } from '~/view/ui-utility/theme'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'

type IGeometryPropComp = {
  label: string
  operateKey: keyof IGeometry
}

export const GeometryPropComp: FC<IGeometryPropComp> = ({ label, operateKey }) => {
  const { classes } = useStyles({})
  const { geometry, isChangedGeometry, setGeometry } = OperateGeometry
  const ref = useRef<HTMLDivElement>(null)
  const operateDataCache = useSignal(0)
  const slideRate = 1 / StageViewport.zoom.value

  useHookSignal(StageViewport.zoom)
  useHookSignal(isChangedGeometry)
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

    if (operateKey === 'x') {
      const datum = OperateNode.datumXY.x
      return geometry[operateKey] - datum
    }
    if (operateKey === 'y') {
      const datum = OperateNode.datumXY.y
      return geometry[operateKey] - datum
    }
    return geometry[operateKey]
  }

  const formatNumber = (value: number): string => {
    if (Number.isInteger(value)) {
      return value.toString()
    } else {
      return value.toFixed(2)
    }
  }

  return (
    <CompositeInput
      ref={ref}
      className={classes.input}
      label={label}
      value={formatNumber(produceValue())}
      onNewValueApply={(v) => setGeometry(operateKey, produceValue(Number(v)))}
      slideRate={slideRate}
    />
  )
}

type IGeometryPropCompStyle =
  {} /* & Required<Pick<ISchemaGeometryPropComp>> */ /* & Pick<ISchemaGeometryPropComp> */

const useStyles = makeStyles<IGeometryPropCompStyle>()((t) => ({
  input: {},
}))

GeometryPropComp.displayName = 'SchemaGeometryPropComp'
