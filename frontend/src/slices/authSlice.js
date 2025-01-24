import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

export const checkBlockStatus = createAsyncThunk(
  "auth/checkBlockStatus",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/check-status");
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        sessionStorage.removeItem("authInfo");

        dispatch(logout());
      }
      return rejectWithValue(error.response?.data);
    }
  }
);

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
        role,
        otp,
      });
      sessionStorage.setItem("authInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Registration failed" }
      );
    }
  }
);

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ role, credentials }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/${role}/signin`, credentials);
      sessionStorage.setItem("authInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (pendingUserId, { rejectWithValue }) => {
    try {
      const response = await api.post("/resend-otp", { pendingUserId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to resend OTP" }
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/logout");
      sessionStorage.removeItem("authInfo");
      return null;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const forgotPasswordSendOTP = createAsyncThunk(
  "auth/forgotPasswordSendOTP",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/forgot-password", { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to send OTP" }
      );
    }
  }
);

export const verifyForgotPasswordOTP = createAsyncThunk(
  "auth/verifyForgotPasswordOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post("/verify-forgot-password", {
        email,
        otp,
      });
      sessionStorage.setItem("authInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "OTP verification failed" }
      );
    }
  }
);

export const googleAuth = createAsyncThunk(
  "auth/googleAuth",
  async ({ credentials }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/googleAuth`, credentials);
      sessionStorage.setItem("authInfo", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Authentication failed" }
      );
    }
  }
);

const getInitialAuthState = () => {
  const authInfo = sessionStorage.getItem("authInfo");
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
    otpResendStatus: "idle",
    forgotPasswordStatus: "idle",
    forgotPasswordEmail: "",
  },
  reducers: {
    setForgotPasswordEmail: (state, action) => {
      state.forgotPasswordEmail = action.payload;
    },
    clearMessage: (state) => {
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(checkBlockStatus.rejected, (state, action) => {
        if (action.payload?.message === "Your account has been blocked") {
          state.authInfo = null;
          state.error = "Your account has been blocked";
        }
      })

      .addCase(initiateSignUp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initiateSignUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.pendingUserId = action.payload.pendingUserId;
        state.message = action.payload.message;
      })
      .addCase(initiateSignUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "sign-up error occured";
      })

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

      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.authInfo = {
          user: action.payload.user || action.payload,
          token: action.payload.token,
        };
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Sign-in failed";
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
      })

      .addCase(resendOTP.pending, (state) => {
        state.otpResendStatus = "loading";
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.otpResendStatus = "succeeded";
        state.message = action.payload.message;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.otpResendStatus = "failed";
        state.error = action.payload?.message || "Failed to resend OTP";
      })

      // Handle forgotPasswordSendOTP
      .addCase(forgotPasswordSendOTP.pending, (state) => {
        state.forgotPasswordStatus = "loading";
        state.error = null;
      })
      .addCase(forgotPasswordSendOTP.fulfilled, (state, action) => {
        state.forgotPasswordStatus = "otpSent";
        state.message = action.payload.message;
        state.error = null;
        state.forgotPasswordEmail = action.meta.arg;
      })
      .addCase(forgotPasswordSendOTP.rejected, (state, action) => {
        state.forgotPasswordStatus = "failed";
        state.error = action.payload?.message || "Failed to send OTP";
      })

      .addCase(verifyForgotPasswordOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyForgotPasswordOTP.fulfilled, (state, action) => {
        state.authInfo = action.payload.user;
        state.isLoading = false;
        state.error = null;
        state.forgotPasswordStatus = "success";
        state.message = action.payload.message;
      })
      .addCase(verifyForgotPasswordOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "OTP verification failed";
        state.forgotPasswordStatus = "failed";
      })
      .addCase(googleAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.authInfo = action.payload;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Google authentication failed";
      });
  },
});

export const { setForgotPasswordEmail, clearMessage } = authSlice.actions;
export default authSlice.reducer;
