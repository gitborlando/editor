import autobind from 'class-autobind-decorator'
import { createCache } from '~/shared/cache'
import { createSignal } from '~/shared/signal'
import { SchemaPage } from './schema/page'

export type IDiff<T = any> = IDiffAdd<T> | IDiffReplace<T> | IDiffRemove
export type IDiffPath = (string | number)[]

type IDiffAdd<T = any> = {
  op: 'add'
  path: IDiffPath
  value: T
}
type IDiffReplace<T = any> = {
  op: 'replace'
  path: IDiffPath
  value: T
}
type IDiffRemove = {
  op: 'remove'
  path: IDiffPath
}

export type IOperateDiff = {
  description: string
  diffs: IDiff<any>[]
  inverseDiffs: IDiff<any>[]
}

@autobind
export class DiffService {
  diff = new Map<IDiffPath, IDiff<any>>()
  inverseDiff = new Map<IDiffPath, IDiff<any>>()
  allDiffs = createSignal(
    <{ description: string; diffs: IDiff<any>[]; inverseDiffs: IDiff<any>[] }[]>[]
  )
  setAddPatch(path: IDiffPath, value: any) {
    this.diff.set(path, { op: 'add', path, value })
  }
  setReplacePatch(path: IDiffPath, value: any) {
    this.diff.set(path, { op: 'replace', path, value })
  }
  setRemovePatch(path: IDiffPath) {
    this.diff.set(path, { op: 'remove', path })
  }
  setInverseAddPatch(path: IDiffPath) {
    this.inverseDiff.set(path, { op: 'remove', path })
  }
  setInverseReplacePatch(path: IDiffPath, oldValue: any) {
    this.inverseDiff.set(path, { op: 'replace', path, value: oldValue })
  }
  setInverseRemovePatch(path: IDiffPath, oldValue: any) {
    this.inverseDiff.set(path, { op: 'add', path, value: oldValue })
  }
  commitOperateDiff(description: string) {
    const operateDiff = <IOperateDiff>{
      description,
      diffs: [...this.diff.values()],
      inverseDiffs: [...this.inverseDiff.values()],
    }
    this.allDiffs.dispatch((allDiff) => allDiff.push(operateDiff))
    this.diff = new Map()
    this.inverseDiff = new Map()
    return operateDiff
  }
}

export const Diff = new DiffService()

const nodePathCache = createCache<IDiffPath>()
export function createNodeDiffPath(id: string, paths?: string[]) {
  return nodePathCache.getSet(`${id}/${paths?.toString() || ''}`, () => {
    return ['nodes', SchemaPage.currentId.value, id, ...(paths || [])]
  })
}
