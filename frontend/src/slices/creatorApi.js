import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosConfig";

export const initiateSignUp = createAsyncThunk(
  "creator/initiateSignUp",
  async (creatorData) => {
    const response = await api.post("/creator/signup", creatorData);
    return response.data;
  }
);

export const verifyOTP = createAsyncThunk(
  "creator/verifyOTP",
  async ({ pendingUserId, otp }) => {
    const response = await api.post("/creator/verify-otp", {
      pendingUserId,
      otp,
    });
    return response.data;
  }
);

export const signIn = createAsyncThunk(
  "creator/signIn",
  async (credentials) => {
    const response = await api.post("/creator/signin", credentials);
    return response.data;
  }
);

export const forgotPassword = createAsyncThunk(
  "creator/forgotPassword",
  async (email) => {
    const response = await api.post("/creator/forgot-password", { email });
    return response.data;
  }
);

export const verifyForgotOTP = createAsyncThunk(
  "creator/verifyForgotOTP",
  async ({ email, otp }) => {
    const response = await api.post("/creator/forgot-password/verify-otp", {
      email,
      otp,
    });
    return response.data;
  }
);

export const logout = createAsyncThunk("creator/logout", async () => {
  await api.post("/creator/logout");
});
