import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import React from "react";

const AdminRoute = ({ redirectPath }) => {
  const { adminInfo, isAuthenticated } = useSelector((state) => state.admin);

  if (!isAuthenticated || !adminInfo) {
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
