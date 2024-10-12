import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

export const initiateSignUp = createAsyncThunk(
  "auth/initiateSignUp",
  async ({ role, userData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/${role}/signup`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Registration failed" }
      );
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ role, pendingUserId, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/${role}/verify-otp`, {
        pendingUserId,
        otp,
      });
      localStorage.setItem("authInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ role, credentials }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/${role}/signin`, credentials);
      localStorage.setItem("authInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (role, { rejectWithValue }) => {
    try {
      await api.post(`/${role}/logout`);
      localStorage.removeItem("authInfo");
      return null;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Helper function to get initial auth state from localStorage
const getInitialAuthState = () => {
  const authInfo = localStorage.getItem("authInfo");
  return authInfo ? JSON.parse(authInfo) : null;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authInfo: getInitialAuthState(),
    isLoading: false,
    error: null,
    pendingUserId: null,
    message: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(initiateSignUp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initiateSignUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.pendingUserId = action.payload.pendingUserId; // Make sure this matches the response
        state.message = action.payload.message; // Also make sure this matches the response
      })
      .addCase(initiateSignUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "An error occurred";
      })

      // Handle verifyOTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.authInfo = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Invalid OTP";
      })

      // Handle signIn
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.authInfo = action.payload.user;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Invalid credentials";
      })

      // Handle logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authInfo = null;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Logout failed";
      });
  },
});

export default authSlice.reducer;
