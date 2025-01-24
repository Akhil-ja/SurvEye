/* eslint-disable react/react-in-jsx-scope */
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Wallet } from "./components/wallet";
import AdminNavbar from "./components/adminNavbar";
import UserNavbar from "./components/userNavbar";
import { ToastContainer } from "react-toastify";
import { Toaster } from "@/components/ui/toaster";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "./components/adminSidebar";
import UserSidebar from "./components/userSidebar";
import CreatorSidebar from "./components/creatorSidebar";
import MessageReceiver from "./components/MessageReceiver";
import { socketService } from "./socketIO/socketServices";

const App = () => {
  const authInfo = sessionStorage.getItem("authInfo");

  useEffect(() => {
    if (authInfo) {
      try {
        const parsedAuthInfo = JSON.parse(authInfo);
        const userDetails = {
          id: parsedAuthInfo.user.id,
          role: parsedAuthInfo.user.role,
        };
        socketService.connect(userDetails);
      } catch (error) {
        console.error("Error parsing authInfo:", error);
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, [authInfo]);

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
    } else if (location.pathname.startsWith("/creator")) {
      return <CreatorSidebar className="bg-gray-800 bg-opacity-80" />;
    } else if (location.pathname.startsWith("/user")) {
      return <UserSidebar className="bg-gray-800 bg-opacity-80" />;
    }
  };

  return (
    <Wallet>
      <MessageReceiver />
      {renderNavbar()}

      <div className="layout">
        <div className="sidebar">{renderSidebar()}</div>

        <div className="main-content">
          <Outlet />
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
      <Toaster />
    </Wallet>
  );
};
export default App;
