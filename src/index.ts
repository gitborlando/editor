import { configure } from 'mobx'
import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './view/app'

import 'virtual:uno.css'

configure({ enforceActions: 'never' })

ReactDOM.createRoot(document.getElementById('root')!).render(createElement(App))
