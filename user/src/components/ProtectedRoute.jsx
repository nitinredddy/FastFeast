import React, { useEffect, useState } from "react";
import axios from "../api/axios.js";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    axios
      .get("/auth/verify") // backend route to verify JWT cookie
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
