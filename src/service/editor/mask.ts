import autoBind from 'auto-bind'
import { makeObservable } from 'mobx'
import { EE } from '~/helper/event-emitter'
import { EditorService } from './editor'

export class MaskService {
  private _divRef?: HTMLDivElement
  constructor(private editor: EditorService) {
    autoBind(this)
    makeObservable(this, {})
  }
  get divRef() {
    return this._divRef!
  }
  get style() {
    return this.divRef.style
  }
  setRef(div: HTMLDivElement) {
    this._divRef = div
    EE.emit('mask-div-exist')
  }
  setShow(show: boolean) {
    this.divRef.style.display = show ? 'block' : 'none'
    return this
  }
}
