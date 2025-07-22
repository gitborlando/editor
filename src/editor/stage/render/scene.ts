import { createObjCache, firstOne } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { OBB } from 'src/editor/math/obb'
import { OperateNode } from 'src/editor/operate/node'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageMarquee } from 'src/editor/stage/render/widget/marquee'
import { StageTransform } from 'src/editor/stage/render/widget/transform'
import { StageVectorEdit } from 'src/editor/stage/render/widget/vector-edit'
import { ImmuiPatch } from 'src/shared/immui/immui'
import { mergeSignal } from 'src/shared/signal/signal'
import { IClientXY } from 'src/shared/utils/event'
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
  sceneRoot = new Elem('sceneRoot', 'sceneElem')
  widgetRoot = new Elem('widgetRoot', 'widgetElem')

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

    const elem = new Elem(node.id, 'sceneElem', parent)
    this.elements.set(node.id, elem)

    this.updateNode(node)
  }

  private updateNode(node: INode) {
    if (!node) return

    const elem = this.findElem(node.id)
    Surface.collectDirty(elem)

    elem.obb = OBB.FromRect(node, node.rotation)
    elem.draw = (ctx, path2d) => StageNodeDrawer.draw(node, elem, ctx, path2d)
    elem.optimize = true

    if (node.type === 'frame') elem.clip = true

    Surface.collectDirty(elem)
  }

  private unmountNode(id: ID) {
    const elem = this.findElem(id)
    if (!elem) return

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

    if (parent !== this.sceneRoot) {
      Surface.collectDirty(parent)
    }
  }

  getElemsFromPoint(e?: IClientXY, type: Elem['type'] = 'sceneElem') {
    return Surface.getElemsFromPoint(e).filter((elem) => elem.type === type)
  }

  private bindNodeHover() {
    OperateNode.hoverId$.hook((thisId, lastId) => {
      if (lastId === thisId) return

      const lastElem = lastId ? this.findElem(lastId) : undefined
      const thisElem = thisId ? this.findElem(thisId) : undefined

      if (lastElem && lastElem.outline !== 'select') {
        lastElem.outline = undefined
        Surface.collectDirty(lastElem)
      }

      if (thisElem && thisElem.outline !== 'select') {
        const node = Schema.find(thisElem.id)
        if (node.type === 'frame' && thisElem.parent === this.sceneRoot) return

        thisElem.outline = 'hover'
        Surface.collectDirty(thisElem)
      }
    })

    Surface.addEvent('mousemove', () => {
      if (StageInteract.currentType.value !== 'select') return

      const elemsFromPoint = this.getElemsFromPoint()
      OperateNode.hoverId$.dispatch(firstOne(elemsFromPoint)?.id || '')
    })
  }
}

export const StageScene = new StageSceneService()
