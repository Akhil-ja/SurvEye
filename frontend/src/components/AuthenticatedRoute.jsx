import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import React from "react";

export const AuthenticatedRoute = ({ redirectPath }) => {
  const authInfo = useSelector((state) => state.auth.authInfo);

  if (authInfo) {
    const role = authInfo.role;
    const dynamicRedirectPath = redirectPath.replace("${role}", role);
    return <Navigate to={dynamicRedirectPath} replace />;
  }

  return <Outlet />;
};

AuthenticatedRoute.propTypes = {
  redirectPath: PropTypes.string,
};

AuthenticatedRoute.defaultProps = {
  redirectPath: "/${role}/home",
};

export default AuthenticatedRoute;
