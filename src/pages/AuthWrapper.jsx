import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const isTokenExpired = () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    return true; 
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    return decodedToken.exp < currentTime; 
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return true; 
  }
};

const AuthWrapper = () => {
  return isTokenExpired() ? <Navigate to="/" replace /> : <Outlet />;
};

export default AuthWrapper;
