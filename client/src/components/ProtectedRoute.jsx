import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const isAdminRoute = requiredRole === 'admin';
    const isElevated = user?.role === 'admin' || user?.role === 'teacher' || user?.isAdmin;
    const hasAccess = isAdminRoute ? isElevated : user?.role === requiredRole;

    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
