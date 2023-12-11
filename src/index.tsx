import { configure } from 'mobx'
import ReactDOM from 'react-dom/client'
import { App } from './view/app'

configure({ enforceActions: 'never' })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
