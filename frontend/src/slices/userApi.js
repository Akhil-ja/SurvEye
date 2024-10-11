import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

export const initiateSignUp = createAsyncThunk(
  "user/initiateSignUp",
  async (userData) => {
    const response = await api.post("/user/signup", userData);
    return response.data;
  }
);

export const verifyOTP = createAsyncThunk(
  "user/verifyOTP",
  async ({ pendingUserId, otp }) => {
    const response = await api.post("/user/verify-otp", { pendingUserId, otp });
    return response.data;
  }
);

export const signIn = createAsyncThunk("user/signIn", async (credentials) => {
  const response = await api.post("/user/signin", credentials);
  return response.data;
});

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email) => {
    const response = await api.post("/user/forgot-password", { email });
    return response.data;
  }
);

export const verifyForgotOTP = createAsyncThunk(
  "user/verifyForgotOTP",
  async ({ email, otp }) => {
    const response = await api.post("/user/forgot-password/verify-otp", {
      email,
      otp,
    });
    return response.data;
  }
);

export const logout = createAsyncThunk("user/logout", async () => {
  await api.post("/user/logout");
});
