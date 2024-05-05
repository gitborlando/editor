import { Graphics } from '@pixi/react'
import { FC, memo } from 'react'
import { IVector } from '~/editor/schema/type'
import { PIXI } from '~/editor/stage/pixi'
import { useCollectRef, useDraw, useResetOBB } from '../hooks'

type IVectorComp = {
  vector: IVector
}

export const VectorComp: FC<IVectorComp> = memo(({ vector }) => {
  const ref = useCollectRef<PIXI.Graphics>(vector)
  const draw = useDraw(vector)
  useResetOBB(vector)

  return <Graphics ref={ref} draw={draw} />
})

VectorComp.displayName = 'VectorComp'
