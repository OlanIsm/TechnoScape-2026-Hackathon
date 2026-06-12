import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { CollectiveBuyPage } from './pages/CollectiveBuyPage';
import { DashboardPage } from './pages/DashboardPage';
import { EntryPage } from './pages/EntryPage';
import { LoginPlaceholderPage } from './pages/LoginPlaceholderPage';
import { RegisterPage } from './pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <EntryPage /> },
      { path: 'login', element: <LoginPlaceholderPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'collective-buy', element: <CollectiveBuyPage /> },
    ],
  },
]);
