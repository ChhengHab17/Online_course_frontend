import {Navigate, useNavigate} from "react-router-dom";
import Login from "../pages/Login.jsx";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children, role, onRegisterClick, onLoginClick}) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const navigate = useNavigate();

  // If not logged in, block access and go back
  useEffect(() => {
    if (!token) {
      // Go back to previous page and show login modal
      navigate('/');
      // Trigger login modal in parent component
      if (onLoginClick) {
        onLoginClick();
      }
    }
  }, [token, navigate, onLoginClick]);

  // If no token, don't render the protected content
  if (!token) {
    return null;
  }

  // Role check
  if (role && userRole !== role) {
    return <div className="flex flex-col align-middle justify-center w-full h-screen bg-[#2C3E50]">
      <h1 className="text-7xl text-center font-bold text-[#00AEEF]">You are not allowed here!! </h1>
    </div>;
  }

  return children;
};

export default ProtectedRoute;