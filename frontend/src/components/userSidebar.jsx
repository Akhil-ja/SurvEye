import { FaBars, FaHome, FaUserAlt, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";

const UserSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2  text-white rounded-md"
        aria-label="Toggle sidebar"
      >
        <FaBars className="text-2xl" />
      </button>

      <div
        className={`fixed top-0 left-0 z-40 bg-gray-800/50 h-screen p-4 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        <nav>
          <ul className="space-y-4 mt-10">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <FaHome className="text-xl text-white" />
                <span className="text-white">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <FaUserAlt className="text-xl text-white" />
                <span className="text-white">Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="/logout"
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <FaSignOutAlt className="text-xl text-white" />
                <span className="text-white">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for closing sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default UserSidebar;
