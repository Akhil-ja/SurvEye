import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import creatorReducer from "./slices/creatorSlice";

export const store = configureStore({
  reducer: {
    // user: userReducer,
    auth: authReducer,
    admin: adminReducer,
    creator: creatorReducer,
  },
});
