import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal'

@autobind
export class UIOperatePanelService {
  pickerShow = createSignal(false)
  pickerType = createSignal<'color' | 'linear' | 'photo'>('color')
  init() {}
}

export const UIOperatePanel = new UIOperatePanelService()
