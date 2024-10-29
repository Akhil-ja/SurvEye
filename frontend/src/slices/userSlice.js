import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Async thunk for fetching User profile
export const fetchUserProfile = createAsyncThunk(
  "User/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch profile" }
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "User/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      console.log("profile data in slice:", profileData);

      const payload = {
        firstName: profileData.first_name, // Map first_name to firstName
        lastName: profileData.last_name, // Map last_name to lastName
        email: profileData.email,
        number: profileData.number,
        role: profileData.role,
      };

      const response = await api.put("/user/profile", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update profile" }
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "User/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.put("/user/change-password", {
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

const userSlice = createSlice({
  name: "user",
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
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch profile";
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
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

export const { clearMessage, resetPasswordChangeStatus } = userSlice.actions;
export default userSlice.reducer;
