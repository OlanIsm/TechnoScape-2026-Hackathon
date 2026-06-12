import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [{ index: true, element: <div className="blank-canvas" /> }],
  },
]);
