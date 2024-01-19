import { observer, useLocalObservable } from 'mobx-react'
import { FC, useEffect, useRef } from 'react'
import { max } from '~/editor/math/base'
import { IGeometryData, OperateGeometry } from '~/editor/operate/geometry'
import { SchemaNode } from '~/editor/schema/node'
import { StageViewport } from '~/editor/stage/viewport'
import { Drag } from '~/global/event/drag'
import { useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Input } from '~/view/ui-utility/widget/input'

type IGeometryPropComp = {
  label: string
  operateKey: keyof IGeometryData
}

export const GeometryPropComp: FC<IGeometryPropComp> = observer(({ label, operateKey }) => {
  const { classes } = useStyles({})
  const { data } = OperateGeometry
  const ref = useRef<HTMLDivElement>(null)
  const state = useLocalObservable(() => ({
    operateType: '' as typeof operateKey | '',
  }))
  const slideRate = 1 / StageViewport.zoom.value
  useHookSignal(StageViewport.zoom)
  useEffect(() => {
    const label = ref.current?.querySelector('.label')
    const operator = ref.current?.querySelector('.operator')
    operator?.addEventListener('mousedown', () =>
      OperateGeometry.beforeOperate.dispatch([operateKey])
    )
    operator?.addEventListener('mouseup', () => OperateGeometry.afterOperate.dispatch())
    label?.addEventListener('mousedown', () => (state.operateType = operateKey))
    Drag.beforeDrag.hook(() => {
      if (!state.operateType) return
      OperateGeometry.beforeOperate.dispatch([state.operateType])
    })
    Drag.afterDrag.hook(() => {
      if (!state.operateType) return
      OperateGeometry.afterOperate.dispatch()
      state.operateType = ''
    })
  }, [])

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
    <Input
      ref={ref}
      className={classes.input}
      label={label}
      value={Number(produceValue().toFixed(2))}
      onNewValueApply={(v) => (data[operateKey] = produceValue(v))}
      slideRate={slideRate}
    />
  )
})

type IGeometryPropCompStyle =
  {} /* & Required<Pick<ISchemaGeometryPropComp>> */ /* & Pick<ISchemaGeometryPropComp> */

const useStyles = makeStyles<IGeometryPropCompStyle>()((t) => ({
  input: {
    width: '50%',
  },
}))

GeometryPropComp.displayName = 'SchemaGeometryPropComp'
