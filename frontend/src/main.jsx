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

import LandingPage from "./screens/landingPage.jsx";
import LoginScreen from "./screens/signin.jsx";
import CreatorRegisterScreen from "./screens/creatorSignup.jsx";
import UserRegisterScreen from "./screens/userSignup.jsx";
import UserHome from "./screens/userHome";
import CreatorHome from "./screens/creatorHome";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import OTPVerificationScreen from "./screens/RegisterOTPVerification";
import ForgotPasswordOTP from "./screens/ForgotPasswordOTP";
import ForgotPasswordEmail from "./screens/ForgotPasswordEmail";
import AdminSignIn from "./screens/adminSignin";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<LandingPage />} />
      <Route path="/signin" element={<LoginScreen />} />
      <Route path="/creator/signup" element={<CreatorRegisterScreen />} />
      <Route path="/user/signup" element={<UserRegisterScreen />} />
      <Route path="/user/home" element={<UserHome />} />
      <Route path="/creator/home" element={<CreatorHome />} />
      <Route path="/verify-otp" element={<OTPVerificationScreen />} />
      <Route path="/forgot-password-email" element={<ForgotPasswordEmail />} />
      <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
      <Route path="/admin/signin" element={<AdminSignIn />} />
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
