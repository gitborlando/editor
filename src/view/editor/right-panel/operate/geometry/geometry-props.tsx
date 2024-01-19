import { observer } from 'mobx-react'
import { FC } from 'react'
import { StageViewport } from '~/editor/stage/viewport'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { GeometryPropComp } from './geometry-prop'

type IGeometryPropsComp = {}

export const GeometryPropsComp: FC<IGeometryPropsComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex layout='h' className={classes.SchemaBase}>
      <GeometryPropComp label='横坐标' operateKey='x' slideRate={1 / StageViewport.zoom.value} />
      <GeometryPropComp label='纵坐标' operateKey='y' slideRate={1 / StageViewport.zoom.value} />
      <GeometryPropComp label='宽度' operateKey='width' />
      <GeometryPropComp label='高度' operateKey='height' />
      <GeometryPropComp label='旋转' operateKey='rotation' />
      <GeometryPropComp label='边数' operateKey='sides' />
      <GeometryPropComp label='角数' operateKey='points' />
      <GeometryPropComp label='圆角' operateKey='radius' />
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
