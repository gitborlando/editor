import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import { disableDefaultTwoFingerEvent } from 'src/shared/utils/event'
import 'virtual:uno.css'
import { App } from './view/app'

disableDefaultTwoFingerEvent()

ReactDOM.createRoot(document.getElementById('root')!).render(createElement(App))
