import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If they try to access a route they aren't allowed to, send them back
        return <Navigate to={`/${user.role.toLowerCase()}-dashboard`} replace />;
    }

    return children;
};

export default ProtectedRoute;