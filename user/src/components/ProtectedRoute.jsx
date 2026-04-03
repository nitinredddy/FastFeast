import React, { useEffect, useState } from "react";
import axios from "../api/axios.js";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState({ loading: true, authorized: false });

  useEffect(() => {
    axios
      .get("/auth/verify") // backend route to verify JWT cookie
      .then((res) => {
        const isCustomer = res.data?.user?.role === "customer";
        setAuthState({ loading: false, authorized: isCustomer });
      })
      .catch(() => setAuthState({ loading: false, authorized: false }));
  }, []);

  if (authState.loading) return <div>Loading...</div>;
  return authState.authorized ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
