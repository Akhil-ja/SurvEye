import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Async thunk for fetching creator profile
export const fetchCreatorProfile = createAsyncThunk(
  "creator/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/creator/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch profile" }
      );
    }
  }
);

export const updateCreatorProfile = createAsyncThunk(
  "creator/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put("/creator/profile", profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update profile" }
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "creator/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.put("/creator/change-password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to change password" }
      );
    }
  }
);

const creatorSlice = createSlice({
  name: "creator",
  initialState: {
    profile: null,
    isLoading: false,
    error: null,
    message: "",
    passwordChangeStatus: "idle",
  },
  reducers: {
    clearMessage: (state) => {
      state.message = "";
      state.error = null;
    },
    resetPasswordChangeStatus: (state) => {
      state.passwordChangeStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreatorProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCreatorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.error = null;
      })
      .addCase(fetchCreatorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch profile";
      })

      // Handle updateCreatorProfile
      .addCase(updateCreatorProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCreatorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updateCreatorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to update profile";
      })

      .addCase(changePassword.pending, (state) => {
        state.passwordChangeStatus = "loading";
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordChangeStatus = "succeeded";
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeStatus = "failed";
        state.error = action.payload?.message || "Failed to change password";
      });
  },
});

export const { clearMessage, resetPasswordChangeStatus } = creatorSlice.actions;
export default creatorSlice.reducer;
