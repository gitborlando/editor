import autobind from 'class-autobind-decorator'
import hotkeys, { HotkeysEvent } from 'hotkeys-js'
import { Record } from '~/editor/record'
import { createSignal } from '~/shared/signal'
import { SchemaNode } from './schema/node'
import { SchemaUtil } from './schema/util'

type IHotKeys = keyof Omit<HotkeyService, 'init' | 'initHook'>

type IHotkeyEvent = {
  keyboardEvent: KeyboardEvent
  hotkeysEvent: HotkeysEvent
}

@autobind
export class HotkeyService {
  'ctrl+z' = createSignal<IHotkeyEvent>()
  'ctrl+shift+z' = createSignal<IHotkeyEvent>()
  'ctrl+s' = createSignal<IHotkeyEvent>()
  'del' = createSignal<IHotkeyEvent>()
  initHook() {
    this.bindHotkeys()
    this['ctrl+z'].hook(Record.undo)
    this['ctrl+shift+z'].hook(Record.redo)
    this['del'].hook(this.onDel)
  }
  private onDel() {
    if (SchemaNode.selectIds.value.size) {
      SchemaUtil.traverseDelete(SchemaNode.selectIds.value)
    }
  }
  private bindHotkeys() {
    ;(Object.keys(this) as IHotKeys[]).forEach((hotkey) => {
      hotkeys(hotkey, (keyboardEvent, hotkeysEvent) => {
        if (hotkey === 'ctrl+s') return keyboardEvent.preventDefault()
        this[hotkey].dispatch({ keyboardEvent, hotkeysEvent })
      })
    })
  }
}

export const Hotkey = new HotkeyService()
