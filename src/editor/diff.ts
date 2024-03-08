import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal'
import { SchemaPage } from './schema/page'

export type IDiff<T = any> = IDiffAdd<T> | IDiffReplace<T> | IDiffRemove

type IDiffAdd<T = any> = {
  op: 'add'
  path: string
  value: T
}
type IDiffReplace<T = any> = {
  op: 'replace'
  path: string
  value: T
}
type IDiffRemove = {
  op: 'remove'
  path: string
}

@autobind
export class DiffService {
  currentDiffs = new Map<string, IDiff<any>>()
  allDiffs = createSignal(<{ description: string; diffs: IDiff<any>[] }[]>[])
  setDiffAdd(path: string, value: any) {
    this.currentDiffs.set(path, { op: 'add', path: `/${path}`, value })
  }
  setDiffReplace(path: string, value: any) {
    this.currentDiffs.set(path, { op: 'replace', path: `/${path}`, value })
  }
  setDiffRemove(path: string) {
    this.currentDiffs.set(path, { op: 'remove', path: `/${path}` })
  }
  commitCurrentDiffs(description: string) {
    this.allDiffs.value.push({
      description,
      diffs: [...this.currentDiffs.values()],
    })
    this.allDiffs.dispatch()
    this.currentDiffs = new Map()
  }
}

export const Diff = new DiffService()

export function createNodeDiffPath(id: string, path: string = '') {
  return ['nodes', SchemaPage.currentId.value, id, path].join('/')
}
