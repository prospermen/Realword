import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ArticlePage from '../pages/ArticlePage';
import EditorPage from '../pages/EditorPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'article/:slug',
        element: <ArticlePage />,
      },
      {
        path: 'profile/:username',
        element: <ProfilePage />,
      },

      {
        element: <GuestRoute />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'editor',
            element: <EditorPage />,
          },
          {
            path: 'editor/:slug',
            element: <EditorPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);

export default router;