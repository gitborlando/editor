import { nanoid } from 'nanoid'
import { SchemaDefault } from '~/editor/schema/default'
import { INode, ISchema } from '~/editor/schema/type'
import { COLOR } from '~/shared/utils/color'

export function mock10000Nested() {
  let s = new Date().getTime()

  let frameSize = 200
  let size = 100

  const nodes: Record<string, INode> = {}
  const frameIds = <string[]>[]

  for (let i = 0; i < 20000; i++) {
    const rectId = nanoid()
    const frameId = nanoid()
    frameIds.push(frameId)
    let x = i % 100
    let y = ~~(i / 100)

    let frame = SchemaDefault.frame({
      id: frameId,
      width: frameSize,
      height: frameSize,
      x: 0 + x * (frameSize + 30),
      y: 0 + y * (frameSize + 30),
      centerX: 50 + x * (frameSize + 30),
      centerY: 50 + y * (frameSize + 30),
      radius: 10,
      parentId: 'page_1', //'#CCCCCC',
      childIds: [rectId],
    })

    let rect = SchemaDefault.rect({
      id: rectId,
      width: size,
      height: size,
      x: 0 + x * (size + 100 + 30),
      y: 0 + y * (size + 30),
      centerX: 50 + x * (size + 100 + 30),
      centerY: 50 + y * (size + 100 + 30),
      radius: 10,
      parentId: frameId,
      fills: [SchemaDefault.fillColor(COLOR.blue)], //'#CCCCCC',
    })

    nodes[rectId] = rect
    nodes[frameId] = frame
  }
  console.log('mock time: ', new Date().getTime() - s)
  return <ISchema>{
    meta: {
      type: 'meta',
      id: 'meta',
      fileId: 'testFile10000Nested',
      name: '测试文件10000Nested',
      version: 0,
      pageIds: ['page_1'],
      clients: {},
    },
    page_1: {
      id: 'page_1',
      type: 'page',
      name: '测试页面1',
      zoom: 0.05,
      x: 100,
      y: 100,
      childIds: frameIds,
    },
    ...nodes,
  }
}