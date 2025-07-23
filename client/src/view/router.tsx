import { createBrowserRouter, Navigate } from 'react-router'
import { EditorComp } from 'src/view/editor/editor'

const router = createBrowserRouter([
  {
    path: '/',
    element: <EditorComp />,
  },
  {
    path: '*',
    element: <Navigate to='/' />,
  },
])

export default router
