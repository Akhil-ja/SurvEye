/* eslint-disable react/react-in-jsx-scope */
import { FaBars, FaHome } from "react-icons/fa";
import { RiSurveyFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useState } from "react";

const CreatorSidebar = () => {
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
                onClick={toggleSidebar}
                to="creator/home"
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <FaHome className="text-xl text-white" />
                <span className="text-white">Home</span>
              </Link>
            </li>

            <li>
              <Link
                onClick={toggleSidebar}
                to="creator/surveylist"
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <RiSurveyFill className="text-xl text-white" />
                <span className="text-white">Survey List</span>
              </Link>
            </li>
            <li>
              <Link
                onClick={toggleSidebar}
                to="creator/survey"
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-700 rounded"
              >
                <RiSurveyFill className="text-xl text-white" />
                <span className="text-white">Survey</span>
              </Link>
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

export default CreatorSidebar;
