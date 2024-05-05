import { FC, memo } from 'react'
import { OperateGeometry } from '~/editor/operate/geometry'
import { OperateNode } from '~/editor/operate/node'
import { useHookSignal } from '~/shared/signal/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { GeometryItemComp } from './item'

type IGeometryPropsComp = {}

export const GeometryComp: FC<IGeometryPropsComp> = memo(({}) => {
  const { classes } = useStyles({})
  const { geometryKeys } = OperateGeometry
  const { selectedNodes } = OperateNode
  useHookSignal(selectedNodes, { after: 'geometryKeyValue' })

  return (
    selectedNodes.value.length !== 0 && (
      <Flex layout='h' className={classes.SchemaBase}>
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

GeometryComp.displayName = 'SchemaGeometryPropComp'
