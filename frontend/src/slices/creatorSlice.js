import { createSlice } from "@reduxjs/toolkit";
import {
  initiateSignUp,
  verifyOTP,
  signIn,
  forgotPassword,
  verifyForgotOTP,
  logout,
} from "./creatorApi";

const initialState = {
  creator: null,
  token: null,
  isLoading: false,
  error: null,
};

const creatorSlice = createSlice({
  name: "creator",
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
        state.creator = action.payload.creator;
        state.token = action.payload.token;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.creator = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(logout.fulfilled, (state) => {
        state.creator = null;
        state.token = null;
      });
    // Add cases for forgotPassword and verifyForgotOTP as needed
  },
});

export default creatorSlice.reducer;
