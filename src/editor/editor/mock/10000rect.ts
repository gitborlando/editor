import { nanoid } from 'nanoid'
import { SchemaDefault } from 'src/editor/schema/default'
import { INode, ISchema } from 'src/editor/schema/type'
import { COLOR } from 'src/shared/utils/color'

export function mock10000Rect() {
  let s = new Date().getTime()

  let size = 100

  const nodes: Record<string, INode> = {}
  const rectIds = <string[]>[]

  for (let i = 0; i < 10000; i++) {
    const rectId = nanoid()
    let x = i % 100
    let y = ~~(i / 100)

    let rect = SchemaDefault.rect({
      id: rectId,
      width: size,
      height: size,
      x: x * (size + 30),
      y: y * (size + 30),
      radius: 10,
      parentId: 'page_1',
      fills: [SchemaDefault.fillColor(COLOR.blue)], //'#CCCCCC',
    })

    nodes[rectId] = rect
    rectIds.push(rectId)
  }
  console.log('mock time: ', new Date().getTime() - s)
  return <ISchema>{
    meta: {
      type: 'meta',
      id: 'meta',
      fileId: 'test-file-10000rect',
      name: '测试文件10000rect',
      version: 0,
      pageIds: ['page_1'],
    },
    client: {
      id: 'client',
      type: 'client',
      selectIds: [],
      selectPageId: 'page_1',
      viewport: { page_1: { zoom: 1, xy: { x: 100, y: 100 } } },
    },
    page_1: {
      id: 'page_1',
      type: 'page',
      name: '测试页面1',
      zoom: 1,
      x: 100,
      y: 100,
      childIds: rectIds,
    },
    ...nodes,
  }
}
