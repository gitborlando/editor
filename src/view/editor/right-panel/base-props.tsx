import { observer, useLocalObservable } from 'mobx-react'
import { FC, useEffect, useRef } from 'react'
import { numberHalfFix } from '~/editor/math/base'
import { useEditor, useGlobalService } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Input } from '~/view/ui-utility/widget/input'

type IBasePropsComp = {}

export const BasePropsComp: FC<IBasePropsComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { Drag } = useGlobalService()
  const { OperateGeometry } = useEditor()
  const { proxyData } = OperateGeometry
  const xRef = useRef<HTMLDivElement>(null)
  const yRef = useRef<HTMLDivElement>(null)
  const widthRef = useRef<HTMLDivElement>(null)
  const heightRef = useRef<HTMLDivElement>(null)
  const rotationRef = useRef<HTMLDivElement>(null)
  const state = useLocalObservable(() => ({
    onDragProps: [] as (keyof typeof OperateGeometry.proxyData)[],
  }))
  useEffect(() => {
    Drag.beforeDrag.hook(() => {
      if (!state.onDragProps.length) return
      OperateGeometry.beforeOperate.dispatch(state.onDragProps)
    })
    Drag.afterDrag.hook(() => {
      if (!state.onDragProps.length) return
      OperateGeometry.afterOperate.dispatch()
      state.onDragProps = []
    })
    xRef.current?.querySelector('.label')?.addEventListener('mousedown', () => {
      state.onDragProps = ['x']
    })
    yRef.current?.querySelector('.label')?.addEventListener('mousedown', () => {
      state.onDragProps = ['y']
    })
    widthRef.current?.querySelector('.label')?.addEventListener('mousedown', () => {
      state.onDragProps = ['width']
    })
    heightRef.current?.querySelector('.label')?.addEventListener('mousedown', () => {
      state.onDragProps = ['height']
    })
    rotationRef.current?.querySelector('.label')?.addEventListener('mousedown', () => {
      state.onDragProps = ['rotation']
    })
  }, [])
  return (
    <Flex layout='h' className={classes.SchemaBase}>
      <Input
        ref={xRef}
        className={classes.input}
        label='横坐标'
        value={numberHalfFix(proxyData.x)}
        onNewValueApply={(v) => (proxyData.x = v)}
      />
      <Input
        ref={yRef}
        className={classes.input}
        label='纵坐标'
        value={numberHalfFix(proxyData.y)}
        onNewValueApply={(v) => (proxyData.y = v)}
      />
      <Input
        ref={widthRef}
        className={classes.input}
        label='宽度'
        value={proxyData.width}
        onNewValueApply={(v) => (proxyData.width = v)}
      />
      <Input
        ref={heightRef}
        className={classes.input}
        label='高度'
        value={proxyData.height}
        onNewValueApply={(v) => (proxyData.height = v)}
      />
      <Input
        ref={rotationRef}
        className={classes.input}
        label='旋转'
        value={proxyData.rotation}
        onNewValueApply={(v) => (proxyData.rotation = v)}
      />
      {/* {SchemaOperateGeometry.type === 'vector' && 'radius' in SchemaOperateGeometry && (
        <Input
          className={classes.input}
          label='圆角'
          value={SchemaOperateGeometry.radius}
          onNewValueApply={(v) => (SchemaOperateGeometry.radius = v)}
        />
      )} */}
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
