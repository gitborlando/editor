import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import 'virtual:uno.css'
import { App } from './view/app'

ReactDOM.createRoot(document.getElementById('root')!).render(createElement(App))
