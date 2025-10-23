import { ReactNode } from 'react'
import Reconciler, { HostConfig } from 'react-reconciler'
import { Elem, ElemProps } from 'src/editor/stage/render/elem'

const hostConfig: HostConfig<
  'elem',
  ElemProps,
  Elem,
  Elem,
  Elem,
  Elem,
  Elem,
  Elem,
  Elem,
  any,
  any,
  any,
  any
> = {
  supportsMutation: true,

  createInstance(type, props) {
    const elem = new Elem(type, 'widgetElem')
    for (const key in props) {
      if (key === 'events') {
        for (const eventType in props.events) {
          // @ts-ignore
          elem.addEvent(eventType, value[eventType])
        }
      } else if (key === 'children') {
      } else {
        // @ts-ignore
        elem[key] = props[key]
      }
    }
    return elem
  },
  getPublicInstance(instance) {
    return instance
  },
  appendInitialChild(parent, child) {
    parent.addChild(child)
  },
  finalizeInitialChildren() {
    return false
  },
  appendChild(parent, child) {
    parent.addChild(child)
  },
  appendChildToContainer(container, child) {
    container.addChild(child)
  },
  removeChild(parent, child) {
    child.destroy()
  },
  removeChildFromContainer(container, child) {
    container.removeChild(child)
  },
  insertBefore(parent, child, beforeChild) {
    parent.children.splice(parent.children.indexOf(beforeChild), 0, child)
  },
  insertInContainerBefore(container, child, beforeChild) {
    const index = container.children.indexOf(beforeChild!)
    if (index !== -1) container.children.splice(index, 0, child)
  },

  prepareForCommit() {
    return null
  },
  resetAfterCommit() {},
  prepareUpdate(instance, type, oldProps, newProps) {
    return newProps
  },
  commitUpdate(instance, updatePayload) {
    for (const key in updatePayload) {
      if (key === 'events') {
        for (const eventType in updatePayload.events) {
          // @ts-ignore
          instance.addEvent(eventType, updatePayload.events[eventType])
        }
      } else if (key === 'children') {
      } else {
        // @ts-ignore
        instance[key] = updatePayload[key]
      }
    }
  },
  commitMount(instance) {},
  getRootHostContext() {
    return null
  },
  getChildHostContext(parentHostContext, type, rootContainer) {
    return parentHostContext
  },
  shouldSetTextContent(type, props) {
    return false
  },
  clearContainer(container) {
    container.children.forEach((child) => child.destroy())
  },
  detachDeletedInstance(instance) {
    instance.destroy()
  },
  supportsPersistence: false,
  createTextInstance: function (
    text: string,
    rootContainer: Elem,
    hostContext: Elem,
    internalHandle: Reconciler.OpaqueHandle,
  ): Elem {
    throw new Error('Function not implemented.')
  },
  preparePortalMount: function (containerInfo: Elem): void {
    throw new Error('Function not implemented.')
  },
  scheduleTimeout: function (fn: (...args: unknown[]) => unknown, delay?: number) {
    throw new Error('Function not implemented.')
  },
  cancelTimeout: function (id: any): void {
    throw new Error('Function not implemented.')
  },
  noTimeout: undefined,
  isPrimaryRenderer: false,
  getCurrentEventPriority: function (): Reconciler.Lane {
    throw new Error('Function not implemented.')
  },
  getInstanceFromNode: function (node: any): Reconciler.Fiber | null | undefined {
    throw new Error('Function not implemented.')
  },
  beforeActiveInstanceBlur: function (): void {
    throw new Error('Function not implemented.')
  },
  afterActiveInstanceBlur: function (): void {
    throw new Error('Function not implemented.')
  },
  prepareScopeUpdate: function (scopeInstance: any, instance: any): void {
    throw new Error('Function not implemented.')
  },
  getInstanceFromScope: function (scopeInstance: any): Elem | null {
    throw new Error('Function not implemented.')
  },
  supportsHydration: false,
}

const reconciler = Reconciler(hostConfig)

export function renderElem(reactNode: ReactNode, elem: Elem) {
  const root = reconciler.createContainer(elem, 0, null, false, null, '', () => {}, null)
  reconciler.updateContainer(reactNode, root, null, () => {})
  return () => void reconciler.updateContainer(null, root, null, () => {})
}
