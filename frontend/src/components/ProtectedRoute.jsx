import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

export const ProtectedRoute = ({ redirectPath }) => {
  const authInfo = useSelector((state) => state.auth.authInfo);

  if (!authInfo) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  redirectPath: PropTypes.string,
};

ProtectedRoute.defaultProps = {
  redirectPath: "/signin",
};

export default ProtectedRoute;
