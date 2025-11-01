import hotkeys from 'hotkeys-js'
import { configure } from 'mobx'
import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './view/app'

configure({ enforceActions: 'never' })

ReactDOM.createRoot(document.getElementById('root')!).render(createElement(App))

hotkeys('ctrl+m', () => {
  console.log(YState.doc.getMap('schema').toJSON())
})
