import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Spinner from '../components/common/Spinner';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <Spinner label="Checking session..." minHeight={160} />;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
