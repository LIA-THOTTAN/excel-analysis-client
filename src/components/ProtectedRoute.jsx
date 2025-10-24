
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ adminRequired, superAdminRequired }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken'); 
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const { id, role } = decodedToken;
        setIsAuthenticated(true);
        setUserRole(role);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />; 
  }

  if (adminRequired && userRole !== 'admin' && userRole !== 'superadmin') {
    return <Navigate to="/dashboard" />;
  }
  
  if (superAdminRequired && userRole !== 'superadmin') {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}
