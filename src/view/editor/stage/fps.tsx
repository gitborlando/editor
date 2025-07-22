import { FC, memo, useEffect, useRef } from 'react'
import { Editor } from 'src/editor/editor/editor'

import { Flex } from '@gitborlando/widget'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp } from 'src/shared/utils/react'

export const FPSComp: FC<{}> = memo(({}) => {
  const showFPS = useHookSignal(Editor.settings.showFPS)

  const ContentComp = useMemoComp([], ({}) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      let prevTime = performance.now()
      let frames = 0

      let raf: number

      const loop = () => {
        raf = requestAnimationFrame(loop)
        frames++

        const time = performance.now()
        if (time > prevTime + 1000) {
          ref.current!.innerText = `${Math.round(
            Math.max((frames * 1000) / (time - prevTime), 0)
          )}fps`
          prevTime = time
          frames = 0
        }
      }

      loop()

      return () => cancelAnimationFrame(raf)
    }, [])

    return (
      <Flex
        ref={ref}
        layout='c'
        className='wh-fit absolute top-20 right-10 text-20 pointer-events-none'></Flex>
    )
  })

  return showFPS && <ContentComp />
})
