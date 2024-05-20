import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import 'virtual:uno.css'
import { favIcon } from './shared/utils/normal'
import { App } from './view/app'
import Asset from './view/ui-utility/assets'

favIcon(Asset.favIcon.shiyangyang)

ReactDOM.createRoot(document.getElementById('root')!).render(createElement(App))
