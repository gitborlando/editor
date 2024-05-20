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

  for (let i = 0; i < 5000; i++) {
    const rectId = nanoid()
    const frameId = nanoid()
    frameIds.push(frameId)
    let x = i % 100
    let y = ~~(i / 100)

    let frame = SchemaDefault.frame({
      id: frameId,
      width: frameSize,
      height: frameSize,
      x: x * (frameSize + 30),
      y: y * (frameSize + 30),
      radius: 10,
      parentId: 'page_1', //'#CCCCCC',
      childIds: [rectId],
    })

    let rect = SchemaDefault.rect({
      id: rectId,
      width: size,
      height: size,
      x: x * (size + 100 + 30) + (frameSize - size) / 2,
      y: y * (size + 100 + 30) + (frameSize - size) / 2,
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
      fileId: 'test-file-10000Nested',
      name: '测试文件10000Nested',
      version: 0,
      pageIds: ['page_1'],
    },
    client: {
      id: 'client',
      type: 'client',
      selectIds: [],
      selectPageId: 'page_1',
      viewport: { page_1: { zoom: 0.05, x: 100, y: 100 } },
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
