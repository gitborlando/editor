import { configure } from 'mobx'
import { createElement } from 'react'
import ReactDOM from 'react-dom/client'
import { createApp } from 'vue'
import { App } from './view/app'
import VueApp from './vue/app.vue'

configure({ enforceActions: 'never' })

if (__REACT__) {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(createElement(App))
}

if (__VUE__) {
  const app = createApp(VueApp)
  app.mount('#root')
}
