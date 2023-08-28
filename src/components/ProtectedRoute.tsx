import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}): JSX.Element => {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return <></>;
  }

  if (!isLoggedIn) {
    return <Navigate to='/' />;
  } else {
    return <>{children}</>;
  }
};

export default ProtectedRoute;
