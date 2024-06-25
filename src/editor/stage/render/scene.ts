import autobind from 'class-autobind-decorator'
import { OBB } from 'src/editor/math/obb'
import { OperateNode } from 'src/editor/operate/node'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageMarquee } from 'src/editor/stage/render/widget/marquee'
import { StageTransform } from 'src/editor/stage/render/widget/transform'
import { StageVectorEdit } from 'src/editor/stage/render/widget/vector-edit'
import { ImmuiPatch } from 'src/shared/immui/immui'
import { batchSignal, mergeSignal } from 'src/shared/signal/signal'
import { firstOne } from 'src/shared/utils/array'
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
  elements = createObjCache<Elem>()
  sceneRoot = new Elem('sceneRoot', 'sceneNode')
  widgetRoot = new Elem('widgetRoot', 'widgetNode')

  initHook() {
    StageTransform.initHook()
    StageMarquee.initHook()
    StageVectorEdit.initHook()

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
    mergeSignal(Schema.inited, Surface.inited$).hook(this.renderPage)

    Schema.onMatchPatch('/client/selectPageId', this.renderPage)

    Schema.flushingPatches.hook((patch) => {
      const { type, keys } = patch
      if (keys[1] === 'childIds') this.reHierarchy(patch)
      else this.render(type, keys as string[])
    })
  }

  private renderPage() {
    Surface.clearSurface()
    this.sceneRoot.children = []

    const traverse = (id: ID) => {
      const node = Schema.find<INode>(id)
      this.render('add', [node.id])
      if ('childIds' in node) node.childIds.forEach(traverse)
    }

    const page = Schema.find<IPage>(Schema.client.selectPageId)
    page.childIds.forEach(traverse)
  }

  private render(op: ImmuiPatch['type'], keys: string[]) {
    const id = keys[0]
    if (macroMatch`'meta'|'client'`(id)) return

    const node = Schema.find<INode>(id)

    switch (true) {
      case op === 'add' && keys.length === 1:
        if (SchemaUtil.isPageById(id)) break
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

  private mountNode(node: INode) {
    const parent = this.elements.get(node.parentId) || this.sceneRoot

    const elem = new Elem(node.id, 'sceneNode', parent)
    this.elements.set(node.id, elem)

    this.updateNode(node)
  }

  private updateNode(node: INode) {
    const elem = this.findElem(node.id)
    Surface.collectDirty(elem)

    elem.obb = OBB.FromRect(node, node.rotation)
    elem.draw = (ctx, path2d) => StageNodeDrawer.draw(node, elem, ctx, path2d)
    elem.optimize = true

    if (node.type === 'frame') elem.clip = true

    Surface.collectDirty(elem)
  }

  private unmountNode(id: ID) {
    const elem = this.findElem(id) || this.sceneRoot

    elem.children.forEach((child) => {
      this.unmountNode(child.id)
    })

    elem.destroy()
    this.elements.delete(id)

    Surface.collectDirty(elem)
  }

  private reHierarchy(patch: ImmuiPatch) {
    const { type, keys, value } = patch
    const [id, _, index] = keys as [ID, string, number]
    const parent = this.findElem(id) || this.sceneRoot

    if (type === 'add') {
      const elem = this.findElem(value)
      const oldIndex = parent.children.indexOf(elem)
      if (oldIndex !== -1) parent.children.splice(oldIndex, 1)
      parent.children.splice(index, 0, elem)
    }

    Surface.collectDirty(parent)
  }

  private bindNodeHover() {
    let lastFirstElem: Elem

    Surface.addEvent('mousemove', () => {
      if (StageInteract.currentType.value !== 'select') return

      const elemsFromPoint = Surface.elemsFromPoint[0]

      batchSignal(OperateNode.hoverIds, () => {
        OperateNode.clearHover()
        elemsFromPoint.forEach((elem) => OperateNode.hover(elem.id))
      })

      if (lastFirstElem && lastFirstElem.outline !== 'select') {
        lastFirstElem.outline = undefined
        Surface.collectDirty(lastFirstElem)
      }

      const firstElem = (lastFirstElem = firstOne(elemsFromPoint))
      if (!firstElem) return

      const node = Schema.find(firstElem.id)
      if (node.type === 'frame' && firstElem.parent === this.sceneRoot) return
      if (firstElem.outline === 'select') return

      firstElem.outline = 'hover'
      Surface.collectDirty(firstElem)
    })
  }
}

export const StageScene = new StageSceneService()
