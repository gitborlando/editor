import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import { disableDefaultTwoFingerEvent } from 'src/shared/utils/event'
import { App } from './view/app'

import { configure } from 'mobx'
import 'virtual:uno.css'

configure({ enforceActions: 'never' })
disableDefaultTwoFingerEvent()

ReactDOM.createRoot(document.getElementById('root')!).render(createElement(App))
