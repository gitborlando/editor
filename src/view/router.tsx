import { createBrowserRouter, Navigate } from 'react-router'
import { CompTestComp } from 'src/view/component/comp-test'
import { EditorComp } from 'src/view/editor/editor'

const router = createBrowserRouter([
  {
    path: '/',
    element: <EditorComp />,
  },
  {
    path: '/comp-test',
    element: <CompTestComp />,
  },
  {
    path: '*',
    element: <Navigate to='/' />,
  },
])

export default router
