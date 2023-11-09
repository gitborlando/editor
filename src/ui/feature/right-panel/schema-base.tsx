import autoBind from 'auto-bind'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { Input } from '~/ui/widget/input'

type ISchemaBaseComp = {}

export const SchemaBaseComp: FC<ISchemaBaseComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex layout='h' className={classes.SchemaBase}>
      <Input
        className={classes.input}
        label='横坐标'
        value={100}
        min={0}
        max={200}
        onNewValueApply={(v) => {}}
      />
      <Input className={classes.input} label='纵坐标' value={300} onNewValueApply={(v) => {}} />
      <Input className={classes.input} label='长度' value={300} onNewValueApply={(v) => {}} />
      <Input className={classes.input} label='宽度' value={300} onNewValueApply={(v) => {}} />
    </Flex>
  )
})

const SchemaBaseState = new (class {
  public constructor() {
    autoBind(this)
    makeAutoObservable(this)
  }
})()

type ISchemaBaseCompStyle = {} /* & Required<Pick<ISchemaBaseComp>> */ /* & Pick<ISchemaBaseComp> */

const useStyles = makeStyles<ISchemaBaseCompStyle>()((t) => ({
  SchemaBase: {
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  input: {
    width: '50%',
  },
}))

SchemaBaseComp.displayName = 'SchemaBaseComp'
