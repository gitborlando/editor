import { configure } from 'mobx'
import './ioc'
import { renderApp } from './view/app'

configure({ enforceActions: 'never' })

renderApp()
