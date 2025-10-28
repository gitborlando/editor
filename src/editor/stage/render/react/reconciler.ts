import { objKeys } from '@gitborlando/utils'
import { ReactNode } from 'react'
import Reconciler, { HostConfig } from 'react-reconciler'
import { Elem, ElemProps } from 'src/editor/stage/render/elem'

function applyProps(elem: Elem, props: ElemProps, oldProps?: ElemProps) {
  const oldEvents = oldProps?.events || {}
  for (const key of objKeys(oldEvents)) {
    elem.removeEvent(key, oldEvents[key]!)
  }

  for (const key of objKeys(props)) {
    if (key === 'events') {
      const events = props.events || {}
      for (const eventType of objKeys(events)) {
        elem.addEvent(eventType, events[eventType]!)
      }
    } else if (key !== 'children') {
      elem[key] = props[key] as any
    }
  }
}

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

  createInstance(_, props) {
    const elem = new Elem(props.node.id, 'widgetElem')
    applyProps(elem, props)
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
    applyProps(instance, newProps, oldProps)
  },
  commitUpdate(instance, updatePayload) {},
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
  const root = reconciler.createContainer(
    elem,
    0,
    null,
    false,
    null,
    '',
    () => {},
    null,
  )
  reconciler.updateContainer(reactNode, root, null, () => {})
  return () => void reconciler.updateContainer(null, root, null, () => {})
}
