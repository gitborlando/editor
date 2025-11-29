import { StageSurface } from 'src/editor/render/surface'

export const EditorStageSurfaceComp: FC<{}> = observer(({}) => {
  useEffect(() => {
    StageSurface.initCanvasKit()
  })

  return (
    <G className={cls()} ref={StageSurface.setContainer}>
      <canvas id='mainCanvas' />
      <canvas id='topCanvas' style={{ position: 'absolute' }} />
    </G>
  )
})

const cls = classes(css`
  /* background-color: #f7f8fa; */
  background-color: var(--gray-bg);
`)
