import { SchemaService } from '~/service/schema/schema'

export const mockFileJson = (schema: SchemaService) => ({
  meta: { id: 'mock1', name: '测试文件1' },
  nodes: {
    ellipse1: schema.default.ellipse({
      id: 'ellipse1',
      parentId: 'page1',
      width: 200,
      height: 100,
      x: 100,
    }),
    rect2: schema.default.rect({
      id: 'rect2',
      width: 100,
      height: 100,
      x: 100,
      parentId: 'page1',
    }),
    rect4: schema.default.rect({
      id: 'rect4',
      width: 100,
      height: 100,
      x: 100,
      parentId: 'page1',
    }),
    rect3: schema.default.rect({
      id: 'rect3',
      width: 200,
      height: 200,
      x: 200,
      parentId: 'page2',
    }),
  },
  pages: [
    {
      id: 'page1',
      name: '测试页面1',
      // childIds: ['ellipse1' ,  'rect2' , 'rect4'],
      childIds: ['ellipse1'],
    },
    {
      id: 'page2',
      name: '测试页面2',
      childIds: ['rect3'],
    },
  ],
})
