import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    // creator: creatorReducer,
    // user: userReducer,
    auth: authReducer,
  },
});
