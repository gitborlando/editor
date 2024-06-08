import autobind from 'class-autobind-decorator'
import { OBB } from 'src/editor/math/obb'
import { OperateNode } from 'src/editor/operate/node'
import { OperatePage } from 'src/editor/operate/page'
import { StageWidgetMarquee } from 'src/editor/stage/render/widget/marquee'
import { StageWidgetTransform } from 'src/editor/stage/render/widget/transform'
import { ImmuiPatch } from 'src/shared/immui/immui'
import { batchSignal, mergeSignal } from 'src/shared/signal/signal'
import { createObjCache } from 'src/shared/utils/cache'
import { macroMatch } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'
import { Schema } from '../../schema/schema'
import { ID, INode, IPage } from '../../schema/type'
import { StageNodeDrawer } from './draw'
import { Elem } from './elem'
import { Surface } from './surface'

@autobind
class StageSceneService {
  private elements = createObjCache<Elem>()
  sceneRoot = new Elem('sceneRoot')
  widgetRoot = new Elem('widgetRoot')

  initHook() {
    StageWidgetTransform.initHook()
    StageWidgetMarquee.initHook()

    this.setupRootElem()

    this.hookRenderNode()
    this.bindNodeHover()
  }

  findElem(id: string) {
    return this.elements.get(id)
  }

  private setupRootElem() {
    Surface.layerList.push(this.sceneRoot)
    Surface.layerList.push(this.widgetRoot)
    this.sceneRoot.hitTest = () => true
    this.widgetRoot.hitTest = () => true
  }

  private hookRenderNode() {
    mergeSignal(Schema.inited, Surface.inited$).hook(() => {
      const renderPage = () => {
        this.sceneRoot.children = []
        this.render('add', [OperatePage.currentPage.id])
      }
      renderPage()
      Schema.onMatchPatch('/client/selectPageId', renderPage)
    })

    Schema.onFlushPatches.hook((patch) => {
      const { type, keys } = patch
      if (keys[1] === 'childIds') {
        this.reHierarchy(patch)
      } else {
        this.render(type, keys as string[])
      }
    })
  }

  private render(op: ImmuiPatch['type'], keys: string[]) {
    const id = keys[0]
    if (macroMatch`'meta'|'client'`(id)) return

    const node = Schema.find<INode | IPage>(id)

    switch (true) {
      case op === 'add' && keys.length === 1:
        this.mountNode(node)
        break
      case op === 'remove' && keys.length === 1:
        this.unmountNode(id)
        break
      default:
        this.updateNode(node as INode)
        break
    }
  }

  private mountNode(node: INode | IPage) {
    if (node.type === 'page') {
      SchemaUtil.getChildren(node.id).forEach(this.mountNode)
      return
    }

    const elem = new Elem(node.id)
    this.elements.set(node.id, elem)

    const parent = this.elements.get(node.parentId) || this.sceneRoot
    parent.addChild(elem)

    this.updateNode(node)

    SchemaUtil.getChildren(node.id).forEach(this.mountNode)
  }

  private updateNode(node: INode) {
    const elem = this.findElem(node.id)
    Surface.collectDirtyRect(elem.aabb)

    elem.obb = OBB.FromRect(node, node.rotation)
    elem.draw = (ctx, path2d) => StageNodeDrawer.draw(node, elem, ctx, path2d)

    if (node.type === 'frame') elem.clip = true

    Surface.collectDirtyRect(elem.aabb)
  }

  private unmountNode(id: ID) {
    const elem = this.findElem(id)

    elem.children.forEach((child) => {
      this.unmountNode(child.id)
    })

    elem.destroy()
    this.elements.delete(id)

    Surface.collectDirtyRect(elem.aabb)
  }

  private reHierarchy(patch: ImmuiPatch) {
    const { type, keys, value } = patch
    const [id, _, index] = keys as [ID, string, number]
    const parent = this.findElem(id) || this.sceneRoot

    if (type === 'add') {
      const elem = this.findElem(value)
      parent.children.splice(parent.children.indexOf(elem), 1)
      parent.children.splice(index, 0, elem)
    }

    Surface.collectDirtyRect(parent.aabb)
  }

  private bindNodeHover() {
    const { clearHover, hover, hoverIds, selectIds } = OperateNode

    let lastElemsFromPoint: Elem[] = []

    Surface.addEvent('mousemove', () => {
      const endBatch = batchSignal(hoverIds)
      clearHover()
      const elemsFromPoint = Surface.elemsFromPoint[0]
      elemsFromPoint.forEach((elem) => hover(elem.id))
      endBatch()

      lastElemsFromPoint.forEach((elem) => {
        if (elemsFromPoint.includes(elem)) return
        elem.outline = undefined
        Surface.collectDirtyRect(elem.aabb)
      })
      lastElemsFromPoint = elemsFromPoint

      const first = elemsFromPoint[0]
      if (!first) return

      const node = Schema.find(first.id)
      if (node.type === 'frame' && first.parent === this.sceneRoot) return
      if (selectIds.value.has(node.id)) return

      first.outline = 'hover'
      Surface.collectDirtyRect(first.aabb)
    })
  }
}

export const StageScene = new StageSceneService()
