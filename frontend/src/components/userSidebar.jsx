/* eslint-disable react/react-in-jsx-scope */
import { FaBars, FaHome, FaUserAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import { RiSurveyFill } from "react-icons/ri";
import { SiLimesurvey } from "react-icons/si";
import { IoWallet } from "react-icons/io5";

const UserSidebar = () => {
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
        className="fixed top-4 left-4 z-50 p-2 text-white rounded-md"
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
                to="/user/home"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <FaHome className="text-xl text-white" />
                <span className="text-white">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/user/profile"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <FaUserAlt className="text-xl text-white" />
                <span className="text-white">Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="/user/attendedsurveys"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <SiLimesurvey className="text-xl text-white" />
                <span className="text-white">Attended Survey</span>
              </Link>
            </li>
            <li>
              <Link
                to="/user/survey"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <RiSurveyFill className="text-xl text-white" />
                <span className="text-white">Survey</span>
              </Link>
            </li>

            <li>
              <Link
                to="/user/wallet"
                onClick={handleLinkClick}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <IoWallet className="text-xl text-white" />
                <span className="text-white">Wallet</span>
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
