import autoBind from 'auto-bind'
import Konva from 'konva'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FC, useEffect, useRef } from 'react'
import { Layer } from 'react-konva'
import { editor } from '~/service/editor/editor'
import { makeStyles } from '~/view/ui-utility/theme'

type IRulerComp = {}

export const RulerComp: FC<IRulerComp> = observer(({}) => {
  const { classes } = useStyles({})
  const ref = useRef<Konva.Layer>(null)
  useEffect(() => {
    if (!ref.current) return
    for (let i = 0; i <= editor.stage.bound.width; i += 10) {
      const line = new Konva.Line({
        points: [i, 0, i, 5], // Adjust the Y coordinates for the ruler's position
        stroke: 'black',
        strokeWidth: 0.5,
      })
      ref.current.add(line)
      if (i % 50 === 0) {
        const label = new Konva.Text({
          x: i - 10,
          y: 10,
          text: i.toString(),
          fontSize: 10,
          fill: 'black',
        })
        ref.current.add(label)
      }
    }
    for (let i = 0; i <= editor.stage.bound.height; i += 10) {
      const line = new Konva.Line({
        points: [0, i, 5, i], // Adjust the Y coordinates for the ruler's position
        stroke: 'black',
        strokeWidth: 0.5,
      })
      ref.current.add(line)
      if (i % 50 === 0) {
        const label = new Konva.Text({
          x: 10,
          y: i - 10,
          text: i.toString(),
          fontSize: 10,
          fill: 'black',
          rotation: -90,
        })
        ref.current.add(label)
      }
    }
    ref.current.draw()
  }, [ref])
  return <Layer ref={ref} />
})

const RulerState = new (class {
  public constructor() {
    autoBind(this)
    makeAutoObservable(this)
  }
})()

type IRulerCompStyle = {} /* & Required<Pick<IRulerComp>> */ /* & Pick<IRulerComp> */

const useStyles = makeStyles<IRulerCompStyle>()((t) => ({
  Ruler: {},
}))

RulerComp.displayName = 'RulerComp'
