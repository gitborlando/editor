import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Input } from '~/view/ui-utility/widget/input'

type IBasePropsComp = {}

export const BasePropsComp: FC<IBasePropsComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { SchemaNode } = useEditor()
  if (!SchemaNode.selectIds.size) return null
  const node = SchemaNode.find([...SchemaNode.selectIds][0])
  return (
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
        label='宽度'
        value={node.width}
        onNewValueApply={(v) => (node.width = v)}
        min={0}
      />
      <Input
        className={classes.input}
        label='高度'
        value={node.height}
        onNewValueApply={(v) => (node.height = v)}
        min={0}
      />
      <Input
        className={classes.input}
        label='旋转'
        value={node.rotation}
        onNewValueApply={(v) => (node.rotation = v)}
        min={0}
        max={360}
      />
      {node.type === 'vector' && 'radius' in node && (
        <Input
          className={classes.input}
          label='圆角'
          value={node.radius}
          onNewValueApply={(v) => (node.radius = v)}
          min={0}
        />
      )}
    </Flex>
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
