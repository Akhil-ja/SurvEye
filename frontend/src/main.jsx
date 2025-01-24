import { StrictMode } from "react";
import React from "react";
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
import AdminRoute from "./components/adminRoute";
import AdminUserList from "./screens/admin/adminUserList";
import UserProfile from "./screens/user/userProfile";
import CreatorProfile from "./screens/creator/creatorProfile";
import CreatorSurveyList from "./screens/creator/creatorSurveyList";
import CreateSurvey from "./screens/creator/createSurvey";
import MakeSurvey from "./screens/creator/makeSurvey";
import SurveyInfo from "./screens/creator/surveyInfo";
import ActiveSurveys from "./screens/user/surveyList";
import AttendSurvey from "./screens/user/attendSurvey";
import AttendedSurveyList from "./screens/user/attendedSurveyList";
import CategoryPage from "./screens/admin/categoryPage";
import OccupationPage from "./screens/admin/occupationPage";
import WalletView from "./screens/user/wallet";
import TransactionsPage from "./screens/shared/transactionHistory";
import WalletTransactionHistory from "./screens/admin/walletManagment";
import AdminAnnouncement from "./screens/admin/adminAnnouncement";
import UserAnnouncements from "./screens/user/userNotifications";
import SurveyPage from "./screens/admin/surveyPage";
import SurveyAnalytics from "./screens/creator/surveyAnalytics";
import CreatorNotification from "./screens/creator/creatorNotification";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route element={<AuthenticatedRoute />}>
        <Route index element={<LandingPage />} />
        <Route path="/signin" element={<LoginScreen />} />
        <Route path="/creator/signup" element={<CreatorRegisterScreen />} />
        <Route path="/user/signup" element={<UserRegisterScreen />} />
        <Route path="/verify-otp" element={<OTPVerificationScreen />} />

        <Route
          path="/forgot-password-email"
          element={<ForgotPasswordEmail />}
        />
        <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        {/** User routes */}
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/home" element={<UserHome />} />
        <Route path="/user/survey" element={<ActiveSurveys />} />
        <Route path="/user/attendsurvey" element={<AttendSurvey />} />
        <Route path="/user/attendedsurveys" element={<AttendedSurveyList />} />
        <Route path="/user/wallet" element={<WalletView />} />
        <Route path="/user/wallet/history" element={<TransactionsPage />} />
        <Route path="/user/announcements" element={<UserAnnouncements />} />

        {/** Creator routes */}
        <Route path="/creator/home" element={<CreatorHome />} />
        <Route path="/creator/profile" element={<CreatorProfile />} />
        <Route path="/creator/surveylist" element={<CreatorSurveyList />} />
        <Route path="/creator/survey" element={<CreateSurvey />} />
        <Route path="/creator/surveycreate" element={<MakeSurvey />} />
        <Route path="/creator/surveyinfo" element={<SurveyInfo />} />
        <Route path="/creator/transactions" element={<TransactionsPage />} />
        <Route
          path="/creator/notifications"
          element={<CreatorNotification />}
        />
        <Route
          path="/creator/analytics/:surveyId"
          element={<SurveyAnalytics />}
        />
      </Route>

      <Route path="/admin/signin" element={<AdminSignIn />} />
      {/** Admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/users" element={<AdminUserList />} />
        <Route path="/admin/category" element={<CategoryPage />} />
        <Route path="/admin/Occupation" element={<OccupationPage />} />
        <Route path="/admin/wallet" element={<WalletTransactionHistory />} />
        <Route path="/admin/Announcement" element={<AdminAnnouncement />} />
        <Route path="/admin/surveys" element={<SurveyPage />} />
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
