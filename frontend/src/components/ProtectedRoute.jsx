/* eslint-disable react/react-in-jsx-scope */
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import PropTypes from "prop-types";
import { checkBlockStatus } from "../slices/authSlice";

export const ProtectedRoute = ({ redirectPath }) => {
  const dispatch = useDispatch();
  const authInfo = useSelector((state) => state.auth.authInfo);

  useEffect(() => {
    if (authInfo) {
      dispatch(checkBlockStatus());

      const intervalId = setInterval(() => {
        dispatch(checkBlockStatus());
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [dispatch, authInfo]);

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
