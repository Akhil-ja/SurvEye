import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";

import LandingPage from "./screens/shared/landingPage.jsx";
import LoginScreen from "./screens/shared/signin.jsx";
import CreatorRegisterScreen from "./screens/creator/creatorSignup.jsx";
import UserRegisterScreen from "./screens/user/userSignup.jsx";
import UserHome from "./screens/user/userHome";
import CreatorHome from "./screens/creator/creatorHome";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import OTPVerificationScreen from "./screens/shared/RegisterOTPVerification";
import ForgotPasswordOTP from "./screens/shared/ForgotPasswordOTP";
import ForgotPasswordEmail from "./screens/shared/ForgotPasswordEmail";
import AdminSignIn from "./screens/admin/adminSignin";
import AdminHome from "./screens/admin/adminHome";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import AdminUserList from "./screens/admin/adminUserList";
import UserProfile from "./screens/user/userProfile";
import CreatorProfile from "./screens/creator/creatorProfile";
import CreatorSurveyList from "./screens/creator/creatorSurveyList";
import CreateSurvey from "./screens/creator/createSurvey";
import MakeSurvey from "./screens/creator/makeSurvey";
import SurveyInfo from "./screens/creator/surveyInfo";
import ActiveSurveys from "./screens/user/surveyList";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route element={<AuthenticatedRoute />}>
        <Route index element={<LandingPage />} />
        <Route path="/signin" element={<LoginScreen />} />
        <Route path="/creator/signup" element={<CreatorRegisterScreen />} />
        <Route path="/user/signup" element={<UserRegisterScreen />} />
        <Route path="/verify-otp" element={<OTPVerificationScreen />} />
        {/**admin routes change it */}
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/users" element={<AdminUserList />} />

        <Route
          path="/forgot-password-email"
          element={<ForgotPasswordEmail />}
        />
        <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
        <Route path="/admin/signin" element={<AdminSignIn />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        {/**user */}
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/home" element={<UserHome />} />
        <Route path="/user/survey" element={<ActiveSurveys />} />

        {/**creator */}
        <Route path="/creator/home" element={<CreatorHome />} />
        <Route path="/creator/profile" element={<CreatorProfile />} />
        <Route path="/creator/surveylist" element={<CreatorSurveyList />} />
        <Route path="/creator/survey" element={<CreateSurvey />} />
        <Route path="/creator/surveycreate" element={<MakeSurvey />} />
        <Route path="/creator/surveyinfo" element={<SurveyInfo />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
