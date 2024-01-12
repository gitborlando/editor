import { observer, useLocalObservable } from 'mobx-react'
import { FC, useEffect, useRef } from 'react'
import { numberHalfFix } from '~/editor/math/base'
import { IGeometryData, OperateGeometry } from '~/editor/operate/geometry'
import { Drag } from '~/global/event/drag'
import { makeStyles } from '~/view/ui-utility/theme'
import { Input } from '~/view/ui-utility/widget/input'

type IGeometryPropComp = {
  label: string
  operateKey: keyof IGeometryData
  slideRate?: number
}

export const GeometryPropComp: FC<IGeometryPropComp> = observer(
  ({ label, operateKey, slideRate = 1 }) => {
    const { classes } = useStyles({})
    const { data } = OperateGeometry
    const ref = useRef<HTMLDivElement>(null)
    const state = useLocalObservable(() => ({
      operateType: '' as typeof operateKey | '',
    }))
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

    return (
      <Input
        ref={ref}
        className={classes.input}
        label={label}
        value={numberHalfFix(data[operateKey])}
        onNewValueApply={(v) => (data[operateKey] = v)}
        slideRate={slideRate}
      />
    )
  }
)

type IGeometryPropCompStyle =
  {} /* & Required<Pick<ISchemaGeometryPropComp>> */ /* & Pick<ISchemaGeometryPropComp> */

const useStyles = makeStyles<IGeometryPropCompStyle>()((t) => ({
  input: {
    width: '50%',
  },
}))

GeometryPropComp.displayName = 'SchemaGeometryPropComp'
