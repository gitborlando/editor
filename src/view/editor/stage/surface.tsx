import { Surface } from 'src/editor/render/surface'

export const EditorStageSurfaceComp: FC<{}> = observer(({}) => {
  useLayoutEffect(() => {
    return Surface.inited.dispatch(true)
  }, [])

  return (
    <G className={cls()} ref={Surface.setContainer}>
      <canvas ref={Surface.setCanvas} />
      <canvas style={{ position: 'absolute' }} ref={Surface.setTopCanvas} />
    </G>
  )
})

const cls = classes(css`
  /* background-color: #f7f8fa; */
  background-color: var(--gray-bg);
`)
