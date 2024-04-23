import { observer } from 'mobx-react'
import { FC, useRef } from 'react'
import { max } from '~/editor/math/base'
import { IGeometryData, OperateGeometry } from '~/editor/operate/geometry'
import { SchemaNode } from '~/editor/schema/node'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal, useSignal } from '~/shared/signal-react'
import { useDownUpTracker } from '~/shared/utils/down-up-tracker'
import { makeStyles } from '~/view/ui-utility/theme'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'

type IGeometryPropComp = {
  label: string
  operateKey: keyof IGeometryData
}

export const GeometryPropComp: FC<IGeometryPropComp> = observer(({ label, operateKey }) => {
  const { classes } = useStyles({})
  const { data } = OperateGeometry
  const ref = useRef<HTMLDivElement>(null)
  const operateDataCache = useSignal(0)
  const slideRate = 1 / StageViewport.zoom.value

  useHookSignal(StageViewport.zoom)
  useDownUpTracker(
    () => ref.current,
    () => {
      operateDataCache.value = data[operateKey]
      OperateGeometry.beforeOperate.dispatch([operateKey])
    },
    () => {
      if (operateDataCache.value === data[operateKey]) return
      OperateGeometry.afterOperate.dispatch()
    }
  )

  const produceValue = (newValue?: number) => {
    if (newValue !== undefined) {
      if (operateKey === 'x') {
        const datum = SchemaNode.datumXY.x
        return newValue + datum
      }
      if (operateKey === 'y') {
        const datum = SchemaNode.datumXY.y
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
      const datum = SchemaNode.datumXY.x
      return data[operateKey] - datum
    }
    if (operateKey === 'y') {
      const datum = SchemaNode.datumXY.y
      return data[operateKey] - datum
    }

    return data[operateKey]
  }

  return (
    <CompositeInput
      ref={ref}
      className={classes.input}
      label={label}
      value={produceValue().toString()}
      onNewValueApply={(v) => (data[operateKey] = produceValue(Number(v)))}
      slideRate={slideRate}
    />
  )
})

type IGeometryPropCompStyle =
  {} /* & Required<Pick<ISchemaGeometryPropComp>> */ /* & Pick<ISchemaGeometryPropComp> */

const useStyles = makeStyles<IGeometryPropCompStyle>()((t) => ({
  input: {},
}))

GeometryPropComp.displayName = 'SchemaGeometryPropComp'
