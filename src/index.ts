import { configure } from 'mobx'
import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './view/app'

configure({ enforceActions: 'never' })

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(createElement(App))
