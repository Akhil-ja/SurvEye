import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import LandingPage from "./screens/landingPage.jsx";
import LoginScreen from "./screens/signinScreen.jsx";
import CreatorRegisterScreen from "./screens/creatorSignupScreen.jsx";
import UserRegisterScreen from "./screens/userSignupScreen.jsx";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<LandingPage />} />
      <Route path="/signin" element={<LoginScreen />} />
      <Route path="/creator/signup" element={<CreatorRegisterScreen />} />
      <Route path="/user/signup" element={<UserRegisterScreen />} />
    </Route>
  )
);

export default router;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
