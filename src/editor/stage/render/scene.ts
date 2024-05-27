import autobind from 'class-autobind-decorator'
import { mx_create } from 'src/editor/math/matrix'
import { xy_client } from 'src/editor/math/xy'
import { StageWidgetHover } from 'src/editor/stage/render/widget/hover'
import { StageViewport } from 'src/editor/stage/viewport'
import { batchSignal, mergeSignal, multiSignal } from 'src/shared/signal/signal'
import { createObjCache } from 'src/shared/utils/cache'
import { macro_match } from 'src/shared/utils/normal'
import { SchemaUtil } from 'src/shared/utils/schema'
import { OBB } from '../../math/obb'
import { OBB2 } from '../../math/obb2'
import { OperateNode } from '../../operate/node'
import { Schema } from '../../schema/schema'
import { ID, INode, INodeParent } from '../../schema/type'
import { NodeDrawer } from './draw'
import { Elem } from './elem'
import { Surface } from './surface'

@autobind
class StageSceneService {
  elements = createObjCache<Elem>()
  prevNodes = createObjCache<INode>()
  sceneRoot = new Elem()
  widgetRoot = new Elem()

  initHook() {
    Surface.elemList.push(this.sceneRoot)
    Surface.elemList.push(this.widgetRoot)
    this.sceneRoot.draw = (ctx) => {
      ctx.transform(...this.sceneRoot.matrix!)
    }
    this.widgetRoot.draw = (ctx) => {
      ctx.transform(...this.widgetRoot.matrix!)
    }

    mergeSignal(Schema.inited, Surface.inited).hook(() => {
      for (const id in Schema.schema) this.renderNode(id)
    })
    Schema.onFlushPatches.hook(({ keys }) => {
      this.renderNode(keys[0] as string)
    })

    multiSignal(StageViewport.zoom, StageViewport.stageOffset).hook(() => {
      const { zoom, x, y } = StageViewport.getViewport()
      this.sceneRoot.matrix = mx_create(zoom, 0, 0, zoom, x, y)
      this.widgetRoot.matrix = mx_create(zoom, 0, 0, zoom, x, y)
      Surface.requestRender()
    })

    // Surface.inited.hook(() => {
    //   this.bindHover()
    // })

    NodeDrawer.initHook()
    StageWidgetHover.initHook()
  }

  renderNode(id: ID) {
    if (macro_match`'meta'|'client'`(id) || id.startsWith('page_')) return

    const prevNode = this.prevNodes.get(id)
    const curNode = Schema.find<INode>(id)
    if (!prevNode) {
      this.mountNode(curNode)
    } else {
      this.updateNode(prevNode, curNode)
    }

    Surface.requestRender()
  }

  mountNode(node: INode) {
    const elem = new Elem()
    elem.id = node.id
    this.elements.set(node.id, elem)

    const parent = this.elements.get(node.parentId) || this.sceneRoot
    parent.addChild(elem)

    this.updateNode({ id: node.id } as INode, node)

    elem.addEvent('hover', ({ hovered }) => {
      console.log('hovered: ', hovered)
      hovered ? OperateNode.hover(node.id) : OperateNode.unHover(node.id)
    })

    SchemaUtil.getChildren(node.id).forEach((child) => {
      this.mountNode(child)
    })
  }

  updateNode(prevNode: INode, node: INode) {
    if (prevNode.id !== node.id || prevNode === node) return

    const elem = this.elements.get(node.id)
    elem.obb = new OBB2(node.x, node.y, node.width, node.height, node.rotation)
    elem.draw = () => NodeDrawer.draw(node, elem)

    // Surface.collectDirty(elem)

    this.prevNodes.set(node.id, node)

    // if (SchemaUtil.isNodeParent(prevNode)) {
    //   this.diffChildren(prevNode, curNode as INodeParent)
    // }
  }

  private bindHover() {
    const handler = (e: Event) => {
      OperateNode.clearHover()
      const realXY = StageViewport.toViewportXY(xy_client(e))
      const endBatch = batchSignal(OperateNode.hoverIds)
      SchemaUtil.traverseCurPageChildIds(({ id }) => {
        const elem = this.elements.get(id)
        const hovered = elem.hitTest(realXY)
        hovered ? OperateNode.hover(id) : OperateNode.unHover(id)
        return hovered
      })
      endBatch()
    }
    Surface.addEvent('mousemove', handler)
  }

  updateOBB(prevNode: INode | null, curNode: INode) {
    const center = OperateNode.getNodeCenterXY(curNode)
    const obb = new OBB(center.x, center.y, curNode.width, curNode.height, curNode.rotation)
    OperateNode.setNodeRuntime(curNode.id, { obb })
  }

  diffChildren(prevNodeParent: INodeParent, curNodeParent: INodeParent) {
    if (prevNodeParent.childIds === curNodeParent.childIds) return

    const prevChildren = SchemaUtil.getChildren(prevNodeParent.id)
    const curChildren = SchemaUtil.getChildren(curNodeParent.id)

    let [prevHead, curHead] = [0, 0]
    let [prevTail, curTail] = [prevChildren.length - 1, curChildren.length - 1]

    let prevHeadChild = prevChildren[prevHead]
    let curHeadChild = curChildren[curHead]
    let prevTailChild = prevChildren[prevTail]
    let curTailChild = curChildren[curTail]

    let oldChildMap: Record<ID, INode> = null!

    while (prevHead <= prevTail && curHead <= curTail) {
      switch (true) {
        case prevHeadChild.id === curHeadChild.id:
          prevHeadChild = prevChildren[++prevHead]
          curHeadChild = curChildren[++curHead]
          this.updateNode(prevHeadChild, curHeadChild)
          break
        case prevTailChild.id === curTailChild.id:
          prevTailChild = prevChildren[--prevTail]
          curTailChild = curChildren[--curTail]
          this.updateNode(prevTailChild, curTailChild)
          break
        case prevHeadChild.id === curTailChild.id:
          prevHeadChild = prevChildren[++prevHead]
          curTailChild = curChildren[--curTail]
          this.updateNode(prevHeadChild, curTailChild)
          break
        case prevTailChild.id === curHeadChild.id:
          prevTailChild = prevChildren[--prevTail]
          curHeadChild = curChildren[++curHead]
          this.updateNode(prevTailChild, curHeadChild)
          break
        default:
          if (!oldChildMap) {
            oldChildMap = {}
            for (let i = prevHead; i < prevTail; i++) {
              oldChildMap[prevChildren[i].id] = prevChildren[i]
            }
          }
          if (oldChildMap[curHeadChild.id]) {
            this.updateNode(oldChildMap[curHeadChild.id], curHeadChild)
          } else {
            this.mountNode(curHeadChild)
          }
          curHeadChild = curChildren[++curHead]
          break
      }
      if (prevHead > prevTail) {
      } else {
      }
    }
  }
}

export const StageScene = new StageSceneService()
