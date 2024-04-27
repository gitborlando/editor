import { FC, memo } from 'react'
import { OperateGeometry } from '~/editor/operate/geometry'
import { OperateNode } from '~/editor/operate/node'
import { StageSelect } from '~/editor/stage/interact/select'
import { useHookSignal } from '~/shared/signal/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { GeometryPropComp } from './geometry-prop'

type IGeometryPropsComp = {}

export const GeometryPropsComp: FC<IGeometryPropsComp> = memo(({}) => {
  const { classes } = useStyles({})
  const { geometryKeys, isChangedGeometry } = OperateGeometry
  useHookSignal(StageSelect.afterSelect, { after: 'setupGeometry' })
  useHookSignal(isChangedGeometry)

  return (
    OperateNode.selectIds.value.size !== 0 && (
      <Flex layout='h' className={classes.SchemaBase}>
        <GeometryPropComp label='横坐标' operateKey='x' />
        <GeometryPropComp label='纵坐标' operateKey='y' />
        <GeometryPropComp label='宽度' operateKey='width' />
        <GeometryPropComp label='高度' operateKey='height' />
        <GeometryPropComp label='旋转' operateKey='rotation' />
        {geometryKeys.has('radius') && <GeometryPropComp label='圆角' operateKey='radius' />}
        {geometryKeys.has('sides') && <GeometryPropComp label='边数' operateKey='sides' />}
        {geometryKeys.has('points') && <GeometryPropComp label='角数' operateKey='points' />}
      </Flex>
    )
  )
})

type IGeometryPropsCompStyle =
  {} /* & Required<Pick<ISchemaGeometryPropComp>> */ /* & Pick<ISchemaGeometryPropComp> */

const useStyles = makeStyles<IGeometryPropsCompStyle>()((t) => ({
  SchemaBase: {
    flexWrap: 'wrap',
    ...t.default$.borderBottom,
    gap: '4px 4px',
    padding: 8,
  },
}))

GeometryPropsComp.displayName = 'SchemaGeometryPropComp'
