import autobind from 'class-autobind-decorator'
import hotkeys, { HotkeysEvent } from 'hotkeys-js'
import { Record } from '~/editor/record'
import { createSignal } from '~/shared/signal/signal'
import { addListener } from '~/shared/utils/event'
import { SchemaUtil } from './schema/util'

type IHotKeys = keyof Omit<HotkeyService, 'init' | 'initHook' | 'isKeyDown'>

type IHotkeyEvent = {
  keyboardEvent: KeyboardEvent
  hotkeysEvent: HotkeysEvent
}

@autobind
export class HotkeyService {
  isKeyDown = false
  'ctrl+z' = createSignal<IHotkeyEvent>()
  'ctrl+shift+z' = createSignal<IHotkeyEvent>()
  'ctrl+s' = createSignal<IHotkeyEvent>()
  'del' = createSignal<IHotkeyEvent>()
  'ctrl+c' = createSignal<IHotkeyEvent>()
  'ctrl+v' = createSignal<IHotkeyEvent>()
  initHook() {
    this.bindHotkeys()
    this['ctrl+z'].hook(Record.undo)
    this['ctrl+shift+z'].hook(Record.redo)
    // this['ctrl+s'].hook(SchemaFile.saveJsonFile)
    this['del'].hook(SchemaUtil.deleteSelectNodes)
    // this['ctrl+c'].hook(NewSchema.copyNodes)
    // this['ctrl+v'].hook(NewSchema.pasteNodes)
  }
  private bindHotkeys() {
    addListener('keyup', () => (this.isKeyDown = false))
    ;(Object.keys(this) as IHotKeys[]).forEach((hotkey) => {
      hotkeys(hotkey, (keyboardEvent, hotkeysEvent) => {
        keyboardEvent.preventDefault()
        if (['ctrl+c'].includes(hotkey)) {
          if (this.isKeyDown) return
          this.isKeyDown = true
        }
        this[hotkey].dispatch({ keyboardEvent, hotkeysEvent })
      })
    })
  }
}

export const Hotkey = new HotkeyService()
