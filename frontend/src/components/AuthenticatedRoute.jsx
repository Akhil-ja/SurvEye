import { Navigate, Outlet } from "react-router-dom";
import React from "react";

export const AuthenticatedRoute = () => {
  try {
    const authInfo = JSON.parse(sessionStorage.getItem("authInfo"));
    const currentPath = window.location.pathname;

    const publicOnlyRoutes = [
      "/",
      "/signin",
      "/creator/signup",
      "/user/signup",
    ];

    if (authInfo) {
      if (publicOnlyRoutes.includes(currentPath)) {
        const role = authInfo.user?.role;
        if (!role) {
          sessionStorage.removeItem("authInfo");
          return <Navigate to="/signin" replace />;
        }
        return <Navigate to={`/${role}/home`} replace />;
      }
    } else {
      if (!publicOnlyRoutes.includes(currentPath)) {
        return <Navigate to="/signin" replace />;
      }
    }

    return <Outlet />;
  } catch (error) {
    console.error("Error parsing auth info:", error);
    sessionStorage.removeItem("authInfo");
    return <Navigate to="/signin" replace />;
  }
};

export default AuthenticatedRoute;
