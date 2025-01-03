import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

// Admin Sign In
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

// Admin Logout
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

// Get Users
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

// Toggle User Status
export const toggleUserStatus = createAsyncThunk(
  "admin/toggleUserStatus",
  async (userId, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await api.put(`/admin/users/toggleStatus?id=${userId}`);

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

// Get occupations
export const getOccupations = createAsyncThunk(
  "admin/occupations",
  async (isActive, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/getoccupation/${isActive}`);
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

// Toggle Category Status
export const toggleOccupationStatus = createAsyncThunk(
  "admin/toggleOccupationStatus",
  async (occupationId, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/occupation/toggleStatus?occupationId=${occupationId}`
      );
      return response.data.occupation;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create Category
export const createOccupation = createAsyncThunk(
  "admin/createOccupations",
  async (newOccupation, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/occupation", newOccupation);

      return response.data.occupation;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update Category
export const updateOccupation = createAsyncThunk(
  "admin/updateOccupation",
  async ({ occupationId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/occupation?occupationId=${occupationId}`,
        data
      );
      return response.data.occupation;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const getCategories = createAsyncThunk(
  "admin/categories",
  async (isActive, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/getcategories/${isActive}`);
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

// Toggle Category Status
export const toggleCategoryStatus = createAsyncThunk(
  "admin/toggleCategoryStatus",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/category/toggleStatus?categoryId=${categoryId}`
      );
      return response.data.category;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create Category
export const createCategory = createAsyncThunk(
  "admin/createCategory",
  async (newCategory, { rejectWithValue }) => {
    try {
      const response = await api.post("/admin/category", newCategory);

      return response.data.category;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update Category
export const updateCategory = createAsyncThunk(
  "admin/updateCategory",
  async ({ categoryId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/category?categoryid=${categoryId}`,
        data
      );
      return response.data.category;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const getTransactions = createAsyncThunk(
  "admin/transactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/transactions`);
      return response.data.transactions;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const getData = createAsyncThunk(
  "admin/data",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/data`);
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

export const updateAdminPercentCut = createAsyncThunk(
  "admin/updatePercent",
  async (percentage, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/admincut`, { percentage });
      return response.data.adminCutData;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  "admin/createAnnouncement",
  async ({ message, title, target = "all" }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/admin/announcement`, {
        title,
        message,
        target,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getAnnouncement = createAsyncThunk(
  "admin/announcements",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/announcements`);
      return response.data.Announcements;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const getSurveys = createAsyncThunk(
  "admin/getSurveys",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/surveys`);
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

export const toggleSurveyStatus = createAsyncThunk(
  "admin/toggleSurveyStatus",
  async (surveyId, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/admin/surveys/toggle-status?surveyId=${surveyId}`
      );
      return response.data.survey;
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

    categories: [],

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
    transactions: [],
    data: null,
    adminPercentCut: null,
    announcements: [],
    surveys: [],
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
      state.categories = [];
    },

    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
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
        sessionStorage.setItem("adminInfo", JSON.stringify(payload.admin));
        sessionStorage.setItem("token", payload.token);
      })
      .addCase(adminSignIn.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
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
        sessionStorage.removeItem("adminInfo");
        sessionStorage.removeItem("token");
      })
      .addCase(adminLogout.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
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

    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.users = state.users.map((user) =>
          user._id === payload._id ? payload : user
        );
      })
      .addCase(toggleUserStatus.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.categories = payload.categories;
      })
      .addCase(getCategories.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(toggleCategoryStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCategory = action.payload;
        const index = state.categories.findIndex(
          (cat) => cat._id === updatedCategory._id
        );
        if (index !== -1) {
          state.categories[index] = updatedCategory;
        }
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.categories.push(payload);
      })
      .addCase(createCategory.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        const index = state.categories.findIndex(
          (category) => category._id === payload._id
        );
        if (index !== -1) {
          state.categories[index] = payload;
        }
      })
      .addCase(updateCategory.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getOccupations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOccupations.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.occupations = payload.occupations;
      })
      .addCase(getOccupations.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.transactions = payload;
      })
      .addCase(getTransactions.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getData.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.data = payload.data;
      })
      .addCase(getData.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(updateAdminPercentCut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminPercentCut.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.adminPercentCut = payload;
      })
      .addCase(updateAdminPercentCut.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getAnnouncement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnnouncement.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.announcements = payload;
      })
      .addCase(getAnnouncement.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(getSurveys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSurveys.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.surveys = payload.Surveys;
      })
      .addCase(getSurveys.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload || "Something went wrong";
      })
      .addCase(toggleSurveyStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleSurveyStatus.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.surveys = state.surveys.map((survey) =>
          survey._id === payload._id ? payload : survey
        );
      })
      .addCase(toggleSurveyStatus.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

export const { resetAdminState, setFilters, setPagination, clearError } =
  adminSlice.actions;

export default adminSlice.reducer;
