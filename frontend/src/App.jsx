import { Outlet, useLocation } from "react-router-dom";
import AdminNavbar from "./components/adminNavbar";
import UserNavbar from "./components/userNavbar";

const App = () => {
  const location = useLocation();

  const renderNavbar = () => {
    if (location.pathname.startsWith("/admin")) {
      return <AdminNavbar />;
    } else {
      return <UserNavbar />;
    }
  };

  return (
    <>
      {renderNavbar()}
      <Outlet />
    </>
  );
};

export default App;
