import { createSlice } from "@reduxjs/toolkit";
import {
  initiateSignUp,
  verifyOTP,
  signIn,
  forgotPassword,
  verifyForgotOTP,
  logout,
} from "./userApi";

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initiateSignUp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initiateSignUp.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle the response as needed
      })
      .addCase(initiateSignUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "An error occurred";
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
    // Add cases for forgotPassword and verifyForgotOTP as needed
  },
});

export default userSlice.reducer;
