import { Navigate, Outlet } from "react-router-dom";
import PropTypes from "prop-types";
import React from "react";

const AdminRoute = ({ redirectPath }) => {
  const adminInfo = JSON.parse(sessionStorage.getItem("adminInfo"));

  if (!adminInfo) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

AdminRoute.propTypes = {
  redirectPath: PropTypes.string,
};

AdminRoute.defaultProps = {
  redirectPath: "/admin/signin",
};

export default AdminRoute;
