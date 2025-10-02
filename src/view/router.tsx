import { createBrowserRouter, Navigate } from 'react-router'
import { EditorComp } from 'src/view/editor/editor'
import { FilesComp } from 'src/view/pages/files'

const router = createBrowserRouter([
  {
    path: '/',
    element: <FilesComp />,
  },
  {
    path: '/fileId/:fileId',
    element: <EditorComp />,
  },
  {
    path: '*',
    element: <Navigate to='/' />,
  },
])

export default router
