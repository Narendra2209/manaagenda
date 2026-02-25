import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Redirect to the appropriate dashboard
        switch (role) {
            case 'ADMIN':
                return <Navigate to="/admin" replace />;
            case 'EMPLOYEE':
                return <Navigate to="/employee" replace />;
            case 'CLIENT':
                return <Navigate to="/client" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
