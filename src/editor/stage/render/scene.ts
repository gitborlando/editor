import { IXY } from '@gitborlando/geo'
import { createObjCache, firstOne } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { SchemaCreator } from 'src/editor/schema/create'
import { getAllSelectIdMap, YClients } from 'src/editor/schema/y-clients'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { ImmuiPatch } from 'src/shared/immui/immui'
import { macroMatch } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'
import { subscribeKey } from 'valtio/utils'
import { ID, IPage } from '../../schema/type'
import { Elem } from './elem'
import { Surface } from './surface'

@autobind
class StageSceneService {
  elements = createObjCache<Elem>()

  sceneRoot!: Elem
  widgetRoot!: Elem

  rootElems: Elem[] = []

  initHook() {
    this.setupRootElems()
    this.hookRenderNode()
    // this.onHover()
  }

  dispose() {
    this.elements.clear()
    this.rootElems.forEach((elem) => elem.destroy())
    this.rootElems.length = 0
  }

  findElem(id: string) {
    return this.elements.get(id)
  }

  elemsFromPoint(xy?: IXY) {
    return Surface.getElemsFromPoint(xy).filter((elem) => elem.type === 'sceneElem')
  }

  private setupRootElems() {
    this.sceneRoot = new Elem('sceneRoot', 'sceneElem')
    this.widgetRoot = new Elem('widgetRoot', 'widgetElem')
    this.sceneRoot.hitTest = () => true
    this.widgetRoot.hitTest = () => true
    this.rootElems.push(this.sceneRoot, this.widgetRoot)
  }

  private hookRenderNode() {
    Signal.merge(YState.inited$, Surface.inited$).hook(() => {
      this.firstRenderPage()

      subscribeKey(YClients.client, 'selectPageId', () => {
        this.firstRenderPage()
      })

      this.hookPatchRender()
    })
  }

  private firstRenderPage() {
    Surface.clearSurface()
    this.sceneRoot.children = []

    const traverse = (id: ID) => {
      const node = YState.findSnap<V1.Node>(id)
      this.render('add', [node.id])
      if ('childIds' in node) node.childIds.forEach(traverse)
    }

    const page = YState.findSnap<IPage>(YClients.client.selectPageId)
    page.childIds.forEach(traverse)
  }

  private hookPatchRender() {
    YState.flushPatch$.hook((op) => {
      const { type, keys } = op
      if (keys[1] === 'childIds') this.reHierarchy(op)
      else this.render(type, keys as string[])
    })
  }

  private render(op: ImmuiPatch['type'], keys: string[]) {
    const id = keys[0]
    if (macroMatch`'meta'|'client'`(id)) return

    const node = YState.findSnap<V1.Node>(id)

    switch (true) {
      case op === 'add' && keys.length === 1:
        if (SchemaUtil.isPageById(id)) break
        this.mountNode(node)
        break
      case op === 'remove' && keys.length === 1:
        this.unmountNode(id)
        break
      default:
        this.updateNode(node)
        break
    }
  }

  private mountNode(node: V1.Node) {
    const parent = this.elements.get(node.parentId) || this.sceneRoot

    const elem = new Elem(node.id, 'sceneElem')
    this.elements.set(node.id, elem)
    parent.addChild(elem)

    this.updateNode(node)
  }

  private updateNode(node: V1.Node) {
    if (!node) return

    const elem = this.findElem(node.id)

    elem.node = node
    elem.optimize = true

    if (node.type === 'frame') elem.clip = true
  }

  private unmountNode(id: ID) {
    const elem = this.findElem(id)
    if (!elem) return

    elem.children.forEach((child) => {
      this.unmountNode(child.id)
    })

    elem.destroy()
    this.elements.delete(id)
  }

  private reHierarchy(patch: Patch) {
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

  private onHover() {
    let lastHovered: Elem | undefined

    Surface.addEvent('mousemove', (e) => {
      if (StageInteract.interaction !== 'select') return

      const hovered = firstOne(this.elemsFromPoint(e))
      if (lastHovered === hovered) return

      case1: if (lastHovered) {
        const nodeState = YState.find<V1.Node>(lastHovered.node.id)
        if (nodeState.type === 'text') {
          nodeState.style.decoration = undefined
        } else {
          if (getAllSelectIdMap()[lastHovered.node.id]) break case1
          nodeState.outline = undefined
        }
      }
      case2: if (hovered) {
        lastHovered = hovered

        if (getAllSelectIdMap()[hovered.node.id]) break case2

        const nodeState = YState.find<V1.Node>(hovered.node.id)
        if (nodeState.type === 'text') {
          nodeState.style.decoration = SchemaCreator.textDecoration()
        } else if (nodeState.type !== 'frame') {
          nodeState.outline = SchemaCreator.outline()
        }
      }
    })
  }
}

export const StageScene = new StageSceneService()
