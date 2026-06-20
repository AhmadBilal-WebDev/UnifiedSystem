import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("userInfo");

  return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;