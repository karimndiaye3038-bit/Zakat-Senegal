import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

// Le contrôle réel des droits est fait par le serveur ; ici on masque seulement l'interface.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner full />;
  if (!user) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  if (roles && user.role !== 'super_admin' && !roles.includes(user.role)) return <Navigate to="/acces-refuse" replace />;
  return children;
}
