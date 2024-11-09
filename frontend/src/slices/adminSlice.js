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

export const getUsers = createAsyncThunk(
  "admin/users",
  async ({ role, status, search, page, limit } = {}, { rejectWithValue }) => {
    try {
      let url = "/admin/users?";
      if (role && role !== "all") url += `role=${role}&`;
      if (status && status !== "all") url += `status=${status}&`;
      if (search) url += `search=${search}&`;
      if (page) url += `page=${page}&`;
      if (limit) url += `limit=${limit}`;

      const response = await api.get(url);
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
  async (userId, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await api.put(`/admin/users/toggleStatus?id=${userId}`);

      // Optionally refresh the users list after toggling status
      const { filters, pagination } = getState().admin;
      dispatch(getUsers({ ...filters, ...pagination }));

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
    totalUsers: 0,

    filters: {
      role: "all",
      status: "all",
      search: "",
    },

    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
    },
  },
  reducers: {
    resetAdminState: (state) => {
      state.adminInfo = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.users = [];
      state.totalUsers = 0;
    },

    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      // Reset pagination when filters change
      state.pagination.currentPage = 1;
    },

    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Admin Sign In
    builder
      .addCase(adminSignIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminSignIn.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.adminInfo = payload.admin;
        state.token = payload.token;
        state.isAuthenticated = true;
        localStorage.setItem("adminInfo", JSON.stringify(payload.admin));
        localStorage.setItem("token", payload.token);
      })
      .addCase(adminSignIn.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // Admin Logout
    builder
      .addCase(adminLogout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.isLoading = false;
        state.adminInfo = null;
        state.token = null;
        state.isAuthenticated = false;
        state.users = [];
        localStorage.removeItem("adminInfo");
        localStorage.removeItem("token");
      })
      .addCase(adminLogout.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // Get Users
    builder
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.users = payload.users;
        state.totalUsers = payload.total;
        state.pagination.totalPages = Math.ceil(
          payload.total / state.pagination.itemsPerPage
        );
      })
      .addCase(getUsers.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });

    // Toggle User Status
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        // Update the user in the list
        state.users = state.users.map((user) =>
          user._id === payload._id ? payload : user
        );
      })
      .addCase(toggleUserStatus.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

export const { resetAdminState, setFilters, setPagination, clearError } =
  adminSlice.actions;

export default adminSlice.reducer;
