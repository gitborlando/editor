import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'

export type ISetting = {
  color: string
}

@autobind
@injectable()
export class SettingService {
  @observable setting = <ISetting>{}
  constructor() {
    makeObservable(this)
    this.initSetting()
  }
  get color() {
    return this.setting.color
  }
  setSetting(setting: Partial<ISetting>) {
    this.setting = { ...this.setting, ...setting }
  }
  private initSetting() {
    this.setting.color = '#9166FF'
  }
}

export const injectSetting = inject(SettingService)
