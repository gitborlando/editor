import { configure } from 'mobx'
import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './view/app'

import hotkeys from 'hotkeys-js'
import { YUndo } from 'src/editor/schema/y-undo'
import 'virtual:uno.css'

configure({ enforceActions: 'never' })

ReactDOM.createRoot(document.getElementById('root')!).render(createElement(App))

hotkeys('ctrl+m', () => {
  console.log(YState.doc.getMap('schema').toJSON())
})

hotkeys('alt+n', () => {
  console.log(YUndo.clientUndo.undoStack, YUndo.clientUndo.redoStack)
})
