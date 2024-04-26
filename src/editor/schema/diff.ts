import autobind from 'class-autobind-decorator'
import { createCache2 } from '~/shared/cache'
import { firstOne, lastOne } from '~/shared/utils/list'

export type IPatch<T = any> = IPatchAdd<T> | IPatchReplace<T> | IPatchRemove
export type IPatchPath = string

type IPatchAdd<T = any> = {
  op: 'add'
  path: IPatchPath
  value: T
}
type IPatchReplace<T = any> = {
  op: 'replace'
  path: IPatchPath
  value: T
}
type IPatchRemove = {
  op: 'remove'
  path: IPatchPath
}

export type IAtomDiff = {
  patch: IPatch
  inversePatch: IPatch
}

export type IOperateDiff = {
  description?: string
  patches: IPatch<any>[]
  inversePatches: IPatch<any>[]
}

@autobind
export class SchemaDiffService {
  patchAddMap = createCache2<IPatchPath, IPatch<any>[]>()
  patchReplaceMap = createCache2<IPatchPath, IPatch<any>[]>()
  patchRemoveMap = createCache2<IPatchPath, IPatch<any>[]>()
  inversePatchAddMap = createCache2<IPatchPath, IPatch<any>[]>()
  inversePatchReplaceMap = createCache2<IPatchPath, IPatch<any>[]>()
  inversePatchRemoveMap = createCache2<IPatchPath, IPatch<any>[]>()
  setAddPatch(path: IPatchPath, value: any) {
    this.patchAddMap.getSet(path, () => []).push({ op: 'add', path: `/${path}`, value })
  }
  setReplacePatch(path: IPatchPath, value: any) {
    this.patchReplaceMap.getSet(path, () => []).push({ op: 'replace', path: `/${path}`, value })
  }
  setRemovePatch(path: IPatchPath) {
    this.patchRemoveMap.getSet(path, () => []).push({ op: 'remove', path: `/${path}` })
  }
  setInverseAddPatch(path: IPatchPath) {
    this.inversePatchAddMap.getSet(path, () => []).push({ op: 'remove', path: `/${path}` })
  }
  setInverseReplacePatch(path: IPatchPath, oldValue: any) {
    this.inversePatchReplaceMap
      .getSet(path, () => [])
      .push({ op: 'replace', path: `/${path}`, value: oldValue })
  }
  setInverseRemovePatch(path: IPatchPath, oldValue: any) {
    this.inversePatchRemoveMap
      .getSet(path, () => [])
      .push({ op: 'add', path: `/${path}`, value: oldValue })
  }
  atomAddDiff(path: IPatchPath, oldValue: any) {
    return {
      patch: this.setAddPatch(path, oldValue),
      inversePatch: this.setInverseAddPatch(path),
    }
  }
  atomRemoveDiff(path: IPatchPath, oldValue: any) {
    return {
      patch: this.setRemovePatch(path),
      inversePatch: this.setInverseRemovePatch(path, oldValue),
    }
  }
  atomReplaceDiff(path: IPatchPath, value: any, oldValue: any) {
    return {
      patch: this.setReplacePatch(path, value),
      inversePatch: this.setInverseReplacePatch(path, oldValue),
    }
  }
  commitOperateDiff(description?: string) {
    const patches: IPatch<any>[] = []
    const inversePatches: IPatch<any>[] = []
    this.patchAddMap.forEach((_, patch) => patches.push(lastOne(patch)))
    this.patchReplaceMap.forEach((_, patch) => patches.push(lastOne(patch)))
    this.patchRemoveMap.forEach((_, patch) => patches.push(lastOne(patch)))
    this.inversePatchAddMap.forEach((_, patch) => inversePatches.push(firstOne(patch)))
    this.inversePatchReplaceMap.forEach((_, patch) => inversePatches.push(firstOne(patch)))
    this.inversePatchRemoveMap.forEach((_, patch) => inversePatches.push(firstOne(patch)))
    this.patchAddMap.clear()
    this.patchReplaceMap.clear()
    this.patchRemoveMap.clear()
    this.inversePatchAddMap.clear()
    this.inversePatchReplaceMap.clear()
    this.inversePatchRemoveMap.clear()
    return <IOperateDiff>{
      description,
      patches,
      inversePatches,
    }
  }
}

export const SchemaDiff = new SchemaDiffService()
