/**
 * Route guard. Redirects unauthenticated users to /login and enforces
 * role-based access when `role` is provided.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (role && user.role !== role) {
    // Send users to their own dashboard if they hit the wrong area.
    return <Navigate to={user.role === 'manager' ? '/manager' : '/'} replace />;
  }
  return children;
}
