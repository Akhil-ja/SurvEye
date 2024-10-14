import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    // creator: creatorReducer,
    // user: userReducer,
    auth: authReducer,
    admin: adminReducer,
  },
});
