import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import creatorReducer from "./slices/creatorSlice";
import userReducer from "./slices/userSlice";
import sharedReducer from "./slices/sharedSlice";

export const store = configureStore({
  reducer: {
    shared: sharedReducer,
    user: userReducer,
    auth: authReducer,
    admin: adminReducer,
    creator: creatorReducer,
  },
});
