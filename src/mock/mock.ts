import { nanoid } from 'nanoid'
import { xy_new } from '~/editor/math/xy'
import { COLOR } from '~/shared/utils/color'
import { SchemaDefaultService } from '../editor/schema/default'
import { IFillLinearGradient, INode, ISchema } from '../editor/schema/type'
import { mockNested } from './nested'

export const mockJsonFile = mockNested

export function mockJsonFile2(schemaDefault: SchemaDefaultService) {
  let s = new Date().getTime()

  let size = 100
  const LinearGradient = <IFillLinearGradient>{
    type: 'linearGradient',
    start: xy_new(-size / 2, 0),
    end: xy_new(size / 2, 0),
    stops: [
      { offset: 0, color: COLOR.blue },
      { offset: 1, color: COLOR.pinkRed },
    ],
  }

  const nodes: Record<string, INode> = {}
  let k = 0
  for (let i = 0; i < 10000; i++) {
    const id = nanoid()
    let j = i % 100

    k = ~~(i / 100)

    let node: any = schemaDefault.rect({
      id,
      width: size,
      height: size,
      x: 0 + j * (size + 30),
      y: 0 + k * (size + 30),
      centerX: 50 + j * (size + 30),
      centerY: 50 + k * (size + 30),
      radius: 10,
      parentId: 'page:1',
      fills: [schemaDefault.fillColor(COLOR.blue)], //'#CCCCCC',
    })
    // node = schemaDefault.star({
    //   id,
    //   x: 0 + j * 101,
    //   y: 0 + k * 101,
    //   pivotX: 0 + j * 101,
    //   pivotY: 0 + k * 101,
    //   centerX: 50 + j * 101,
    //   centerY: 50 + k * 101,
    //   points: [
    //     schemaDefault.createPoint(-50, -50, 'no-bezier', 0, XY.Of(-100, -50)),
    //     schemaDefault.createPoint(50, 0, 'no-bezier', 0),
    //     schemaDefault.createPoint(-50, 50, 'no-bezier', 0, undefined, XY.Of(-100, 50)),
    //   ],
    //   parentId: 'page:1',
    // })
    nodes[id] = node
  }
  console.log('mock time: ', new Date().getTime() - s)
  return {
    meta: { id: 'mock1', name: '测试文件1', user: 'myself', version: 0 },
    nodes: { 'page:1': nodes },
    pages: [
      {
        id: 'page:1',
        name: '测试页面1',
        zoom: 0.05,
        x: 100,
        y: 100,
        childIds: Object.keys(nodes),
      },
    ],
  }
}

export function mockJsonFile3(schemaDefault: SchemaDefaultService) {
  let s = new Date().getTime()

  let size = 100
  const LinearGradient = <IFillLinearGradient>{
    type: 'linearGradient',
    start: xy_new(-size / 2, 0),
    end: xy_new(size / 2, 0),
    stops: [
      { offset: 0, color: COLOR.blue },
      { offset: 1, color: COLOR.pinkRed },
    ],
  }

  const nodes: Record<string, INode> = {}
  let k = 0
  for (let i = 0; i < 5000; i++) {
    const id = nanoid()
    let j = i % 100

    k = ~~(i / 100)

    let node: any = schemaDefault.rect({
      id,
      width: size,
      height: size,
      x: 0 + j * (size + 30),
      y: 0 + k * (size + 30),
      centerX: 50 + j * (size + 30),
      centerY: 50 + k * (size + 30),
      radius: 10,
      parentId: 'page:1',
      fills: [schemaDefault.fillColor(COLOR.blue)], //'#CCCCCC',
    })
    // node = schemaDefault.star({
    //   id,
    //   x: 0 + j * 101,
    //   y: 0 + k * 101,
    //   pivotX: 0 + j * 101,
    //   pivotY: 0 + k * 101,
    //   centerX: 50 + j * 101,
    //   centerY: 50 + k * 101,
    //   points: [
    //     schemaDefault.createPoint(-50, -50, 'no-bezier', 0, XY.Of(-100, -50)),
    //     schemaDefault.createPoint(50, 0, 'no-bezier', 0),
    //     schemaDefault.createPoint(-50, 50, 'no-bezier', 0, undefined, XY.Of(-100, 50)),
    //   ],
    //   parentId: 'page:1',
    // })
    nodes[id] = node
  }
  console.log('mock time: ', new Date().getTime() - s)
  return <ISchema>{
    meta: { id: 'testFile4', name: '测试文件4', user: 'myself', version: 1 },
    nodes: { 'page:1': nodes },
    pages: [
      {
        id: 'page:1',
        name: '测试页面1',
        zoom: 0.05,
        x: 100,
        y: 100,
        childIds: Object.keys(nodes),
      },
    ],
  }
}
