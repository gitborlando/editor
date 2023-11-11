import { observer } from 'mobx-react'
import { FC } from 'react'
import { editor } from '~/service/editor/editor'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { Input } from '~/ui/widget/input'

type IBasePropsComp = {}

export const BasePropsComp: FC<IBasePropsComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { schema: Schema } = editor
  const node = Schema.findNode(Schema.selectedNodeIds[0])
  return (
    <>
      {node && (
        <Flex layout='h' className={classes.SchemaBase}>
          <Input
            className={classes.input}
            label='横坐标'
            value={node.x}
            onNewValueApply={(v) => {
              node.x = v
            }}
          />
          <Input
            className={classes.input}
            label='纵坐标'
            value={node.y}
            onNewValueApply={(v) => (node.y = v)}
          />
          <Input
            className={classes.input}
            label='长度'
            value={node.width}
            onNewValueApply={(v) => (node.width = v)}
            min={0}
          />
          <Input
            className={classes.input}
            label='宽度'
            value={node.height}
            onNewValueApply={(v) => (node.height = v)}
            min={0}
          />
        </Flex>
      )}
    </>
  )
})

type IBasePropsCompStyle = {} /* & Required<Pick<ISchemaBaseComp>> */ /* & Pick<ISchemaBaseComp> */

const useStyles = makeStyles<IBasePropsCompStyle>()((t) => ({
  SchemaBase: {
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    ...t.default$.borderBottom,
  },
  input: {
    width: '50%',
  },
}))

BasePropsComp.displayName = 'SchemaBaseComp'
