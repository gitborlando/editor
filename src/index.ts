import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import { favIcon } from './shared/utils/normal'
import { App } from './view/app'
import Asset from './view/ui-utility/assets'

favIcon(Asset.favIcon.shiyangyang)

ReactDOM.createRoot(document.getElementById('root')!).render(createElement(App))

// import { immuiPerformanceVs } from './shared/immui/immui.benchmark'

// immuiPerformanceVs()

// fps()
