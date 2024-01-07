import { observer } from 'mobx-react'
import { FC } from 'react'
import { When } from 'react-if'
import { useEditor } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { GeometryPropComp } from './geometry-prop'

type IGeometryPropsComp = {}

export const GeometryPropsComp: FC<IGeometryPropsComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { StageViewport } = useEditor()
  return (
    <Flex layout='h' className={classes.SchemaBase}>
      <GeometryPropComp label='横坐标' operateKey='x' slideRate={1 / StageViewport.zoom} />
      <GeometryPropComp label='纵坐标' operateKey='y' slideRate={1 / StageViewport.zoom} />
      <GeometryPropComp label='宽度' operateKey='width' />
      <GeometryPropComp label='高度' operateKey='height' />
      <GeometryPropComp label='旋转' operateKey='rotation' />
      <When condition={true}>
        <GeometryPropComp label='边数' operateKey='sides' />
      </When>
      {/* {SchemaOperateGeometry.type === 'vector' && 'radius' in SchemaOperateGeometry && (
        <GeometryPropComp
          className={classes.input}
          label='圆角'
          value={SchemaOperateGeometry.radius}
          onNewValueApply={(v) => (SchemaOperateGeometry.radius = v)}
        />
      )} */}
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
