import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return payload.exp ? payload.exp * 1000 > Date.now() : true;
  } catch (error) {
    return false;
  }
};

const AdminPrivateRoute = ({ children }) => {
  const location = useLocation();
  const cookieToken = getCookie("adminToken");
  const storageToken = localStorage.getItem("adminToken");
  const token = cookieToken || storageToken;

  if (!token || !isTokenValid(token)) {
    document.cookie = "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AdminPrivateRoute;
