import { FC, memo } from 'react'
import { OperateGeometry } from '~/editor/operate/geometry'
import { SchemaNode } from '~/editor/schema/node'
import { StageSelect } from '~/editor/stage/interact/select'
import { useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { GeometryPropComp } from './geometry-prop'

type IGeometryPropsComp = {}

export const GeometryPropsComp: FC<IGeometryPropsComp> = memo(({}) => {
  const { classes } = useStyles({})
  const { operateKeys } = OperateGeometry
  useHookSignal(StageSelect.afterSelect)
  if (SchemaNode.selectNodes.length === 0) return null
  return (
    <Flex layout='h' className={classes.SchemaBase}>
      <GeometryPropComp label='横坐标' operateKey='x' />
      <GeometryPropComp label='纵坐标' operateKey='y' />
      <GeometryPropComp label='宽度' operateKey='width' />
      <GeometryPropComp label='高度' operateKey='height' />
      <GeometryPropComp label='旋转' operateKey='rotation' />
      {operateKeys.has('radius') && <GeometryPropComp label='圆角' operateKey='radius' />}
      {operateKeys.has('sides') && <GeometryPropComp label='边数' operateKey='sides' />}
      {operateKeys.has('points') && <GeometryPropComp label='角数' operateKey='points' />}
    </Flex>
  )
})

type IGeometryPropsCompStyle =
  {} /* & Required<Pick<ISchemaGeometryPropComp>> */ /* & Pick<ISchemaGeometryPropComp> */

const useStyles = makeStyles<IGeometryPropsCompStyle>()((t) => ({
  SchemaBase: {
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    ...t.default$.borderBottom,
  },
}))

GeometryPropsComp.displayName = 'SchemaGeometryPropComp'
