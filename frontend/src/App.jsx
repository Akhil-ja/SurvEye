import { Outlet, useLocation } from "react-router-dom";
import AdminNavbar from "./components/adminNavbar";
import UserNavbar from "./components/userNavbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "./components/adminSidebar";
import UserSidebar from "./components/userSidebar";

const App = () => {
  const location = useLocation();

  const renderNavbar = () => {
    if (location.pathname.startsWith("/admin")) {
      return <AdminNavbar />;
    } else {
      return <UserNavbar />;
    }
  };

  const renderSidebar = () => {
    if (location.pathname.startsWith("/admin")) {
      return <AdminSidebar className="bg-gray-800 bg-opacity-80" />;
    } else if (location.pathname.startsWith("/")) {
      /// edit for different routes
      return null;
    } else {
      return <UserSidebar className="bg-gray-800 bg-opacity-80" />;
    }
  };

  return (
    <>
      {renderNavbar()}

      <div className="layout">
        <div className="sidebar">{renderSidebar()}</div>

        <div className="main-content">
          <Outlet />
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default App;
