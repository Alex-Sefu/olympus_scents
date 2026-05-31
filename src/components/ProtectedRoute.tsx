import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';

interface Props {
  children: ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, role, loading } = useAuth();

  // Cât timp se încarcă sesiunea, nu redirecta
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Se verifică sesiunea...</p>
      </div>
    );
  }

  // Neautentificat → mergi la signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Rol insuficient → mergi acasă
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
