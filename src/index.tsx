import { configure } from 'mobx'
import ReactDOM from 'react-dom/client'
import { App } from './view/app'

configure({ enforceActions: 'never' })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)

// import { createClient } from 'pexels'

// const client = createClient('1vbcKedpSbDaktXlI6jmDczCNUBMqDkXL3Gndwp7HMblwGoENO4xlDnm')
// const query = 'Nature'

// client.photos.search({ query }).then((photos) => {
//   console.log(photos)
// })
