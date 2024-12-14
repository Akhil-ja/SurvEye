/* eslint-disable react/react-in-jsx-scope */
import { FaBars, FaHome, FaUserAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import { BiSolidCategory } from "react-icons/bi";
import { CgWorkAlt } from "react-icons/cg";
import { BsTvFill } from "react-icons/bs";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
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
                to="/admin/home"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <FaHome className="text-xl text-white" />
                <span className="text-white">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <FaUserAlt className="text-xl text-white" />
                <span className="text-white">Users</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/category"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <BiSolidCategory className="text-xl text-white" />
                <span className="text-white">Category</span>
              </Link>
              <li>
                <Link
                  to="/admin/occupation"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
                >
                  <CgWorkAlt className="text-xl text-white" />
                  <span className="text-white">Occupation</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/wallet"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
                >
                  <BsTvFill className="text-xl text-white" />
                  <span className="text-white">control Panal</span>
                </Link>
              </li>
            </li>
          </ul>
        </nav>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default AdminSidebar;
