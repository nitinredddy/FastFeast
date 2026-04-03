import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../api/axios.js";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [authState, setAuthState] = useState({
    loading: true,
    authenticated: false,
    authorized: false,
  });

  useEffect(() => {
    axios
      .get("/auth/verify")
      .then((res) => {
        if (res.data.valid && allowedRoles.includes(res.data.user.role)) {
          setAuthState({ loading: false, authenticated: true, authorized: true });
        } else if (res.data.valid) {
          setAuthState({ loading: false, authenticated: true, authorized: false });
        } else {
          setAuthState({ loading: false, authenticated: false, authorized: false });
        }
      })
      .catch(() => setAuthState({ loading: false, authenticated: false, authorized: false }));
  }, [allowedRoles]);

  if (authState.loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-t-4 border-orange-500 rounded-full"></div>
      </div>
    );

  if (!authState.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return authState.authorized ? children : <Navigate to="/forbidden" replace />;
};

export default ProtectedRoute;
