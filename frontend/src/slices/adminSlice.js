import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

export const adminSignIn = createAsyncThunk(
  "admin/signIn",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/signin", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const adminLogout = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/logout");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "admin/toggleUserStatus",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/toggleStatus?id=${userId}`);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    adminInfo: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    users: [],
  },
  reducers: {
    resetAdminState: (state) => {
      state.adminInfo = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle admin sign-in
    builder.addCase(adminSignIn.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(adminSignIn.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.adminInfo = payload.admin;
      state.token = payload.token;
      state.isAuthenticated = true;

      localStorage.setItem("adminInfo", JSON.stringify(payload.admin));
      localStorage.setItem("token", payload.token);
    });
    builder.addCase(adminSignIn.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });

    // Handle admin logout
    builder.addCase(adminLogout.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(adminLogout.fulfilled, (state) => {
      state.isLoading = false;
      state.adminInfo = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("adminInfo");
      localStorage.removeItem("token");
    });
    builder.addCase(adminLogout.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });

    // Handle toggle user status
    builder.addCase(toggleUserStatus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(toggleUserStatus.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.users = state.users.map((user) =>
        user.id === payload.id ? payload : user
      );
    });
    builder.addCase(toggleUserStatus.rejected, (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    });
  },
});

export const { resetAdminState } = adminSlice.actions;

export default adminSlice.reducer;
