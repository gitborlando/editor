import autobind from 'class-autobind-decorator'
import { mergeSignal } from '~/shared/signal/signal'
import { createObjCache } from '~/shared/utils/cache'
import { iife, macro_match } from '~/shared/utils/normal'
import { SchemaUtil } from '~/shared/utils/schema'
import { OBB } from '../math/obb'
import { OperateNode } from '../operate/node'
import { Schema } from '../schema/schema'
import { ID, INode, INodeParent } from '../schema/type'
import { StageDraw } from './draw/draw'
import { PIXI, Pixi } from './pixi'

export type IStageElement = PIXI.Graphics | PIXI.Text

@autobind
export class StageElementService {
  elements = createObjCache<IStageElement>()
  containers = createObjCache<PIXI.Container>()
  prevNodes = createObjCache<INode>()

  initHook() {
    mergeSignal(Schema.inited, Pixi.inited).hook(() => {
      for (const id in Schema.schema) this.renderNode(id)
    })
    Schema.onFlushPatches.hook(({ keys }) => {
      this.renderNode(keys[0] as string)
    })
  }

  renderNode(id: ID) {
    if (macro_match`'meta'|'client'`(id) || id.startsWith('page_')) return
    const prevNode = this.prevNodes.get(id)
    const curNode = Schema.find<INode>(id)
    if (!prevNode) {
      this.mountNode(curNode)
      this.prevNodes.set(curNode.id, curNode)
    } else {
      this.updateNode(prevNode, curNode)
      this.prevNodes.set(curNode.id, curNode)
    }
  }

  mountNode(node: INode) {
    const element = new PIXI[node.type === 'text' ? 'Text' : 'Graphics']()
    this.elements.set(node.id, element)

    const container = iife(() => {
      if (node.type !== 'frame') return null
      return this.containers.set(node.id, new PIXI.Container())
    })
    const parent = iife(() => {
      if (node.parentId.startsWith('page_')) return Pixi.sceneStage
      return this.containers.getSet(node.parentId, () => new PIXI.Container())
    })
    if (container) {
      container.addChild(element)
      parent.addChild(container)
    } else {
      parent.addChild(element)
    }

    StageDraw.collectRedraw(node.id)
    this.updateOBB(null, node)

    SchemaUtil.getChildren(node.id).forEach((child) => {
      this.mountNode(child)
    })
  }

  updateNode(prevNode: INode, curNode: INode) {
    //if (prevNode.id !== curNode.id || prevNode === curNode) return

    StageDraw.collectRedraw(curNode.id)
    this.updateOBB(prevNode, curNode)

    // if (SchemaUtil.isNodeParent(prevNode)) {
    //   this.diffChildren(prevNode, curNode as INodeParent)
    // }
  }

  updateOBB(prevNode: INode | null, curNode: INode) {
    const center = OperateNode.getNodeCenterXY(curNode)
    const obb = new OBB(center.x, center.y, curNode.width, curNode.height, curNode.rotation)
    OperateNode.setNodeRuntime(curNode.id, { obb })
  }

  insertBefore(node: INode, beforeNode: INode) {
    const parent = this.containers.get(beforeNode.parentId)
    parent.addChild(this.elements.get(node.id))
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

export const StageElement = new StageElementService()
