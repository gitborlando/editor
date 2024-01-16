import { configure } from 'mobx'
import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import { favIcon } from './shared/utils/favicon'
import { App } from './view/app'
import Asset from './view/ui-utility/assets'

favIcon(Asset.favIcon.shiyangyang)

configure({ enforceActions: 'never' })

ReactDOM.createRoot(document.getElementById('root')!).render(createElement(App))
