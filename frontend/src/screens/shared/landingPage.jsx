import { LinkContainer } from "react-router-bootstrap";
import React from "react";

const LandingPage = () => {
  return (
    <div className="container mx-auto px-4 bg-white">
      <main className="flex mt-10">
        <div className="w-1/2 pr-8">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: "hsl(20.54, 90.24%, 48.24%)" }} // Updated to correct HSL syntax
          >
            Launch Your Survey Effortlessly
          </h2>

          <p className="mb-20 text-gray-700">
            SurveyHub is your go-to platform for creating and participating in
            insightful surveys. Whether you are a business looking to gather
            valuable customer feedback or someone ready to share your opinion,
            SurveyHub empowers you to gather meaningful insights with ease.
          </p>

          <div className="flex space-x-10 ">
            <LinkContainer to={"/user/signup"}>
              <div className="p-4 cursor-pointer hover:shadow-lg transition border border-red-200 rounded bg-orange-50">
                <h3 className="font-bold mb-2 text-orange-700">Join Now</h3>
                <p className="text-gray-600">
                  Join the community! Sign in to take part in surveys and
                  contribute to ongoing discussions.
                </p>
              </div>
            </LinkContainer>

            <LinkContainer to={"/creator/signup"}>
              <div className="p-4 cursor-pointer hover:shadow-lg transition border border-red-200 rounded ">
                <h3 className="font-bold mb-2 text-gray-800">
                  Create a Survey
                </h3>
                <p className="text-gray-600">
                  Are you a surveyor? Click here to create a survey and gather
                  valuable insights from respondents.
                </p>
              </div>
            </LinkContainer>
          </div>
        </div>

        <div className="w-1/2">
          <div className="bg-gray-100 h-100 flex items-center justify-center rounded-lg">
            <img
              src="/images/Hero.jpeg"
              alt="Survey"
              className="w-full h-full object-cover rounded-lg" // Fill the container
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
