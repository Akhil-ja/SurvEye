import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

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
      const payload = {
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        email: profileData.email,
        number: profileData.number,
        role: profileData.role,
        ...(profileData.date_of_birth && {
          dateOfBirth: profileData.date_of_birth,
        }),
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

export const getSurvey = createAsyncThunk(
  "user/getSurvey",
  async (
    { page = 1, sort = "date", order = "desc", attended = false } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`user/surveys`, {
        params: {
          page,
          sort,
          order,
          attended,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch surveys" }
      );
    }
  }
);

export const fetchSurveyDetails = createAsyncThunk(
  "user/fetchSurveyDetails",
  async (surveyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/surveyinfo?surveyId=${surveyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch survey details" }
      );
    }
  }
);

export const submitSurveyResponses = createAsyncThunk(
  "user/submitSurveyResponses",
  async ({ surveyId, responses }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/user/survey/${surveyId}/submit`, {
        responses,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to submit survey responses" }
      );
    }
  }
);

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  message: "",
  passwordChangeStatus: "idle",
  surveys: {
    loading: false,
    error: null,
    data: {
      surveys: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalSurveys: 0,
      },
    },
    sortBy: "date",
    sortOrder: "desc",
  },
  currentSurvey: {
    loading: false,
    error: null,
    data: null,
    submissionStatus: "idle",
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = "";
      state.error = null;
    },
    resetPasswordChangeStatus: (state) => {
      state.passwordChangeStatus = "idle";
    },
    setSortBy: (state, action) => {
      state.surveys.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.surveys.sortOrder = action.payload;
    },
    clearSurveyErrors: (state) => {
      state.surveys.error = null;
      state.currentSurvey.error = null;
    },
    resetSubmissionStatus: (state) => {
      state.submissionStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Profile reducers
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

      // Update profile reducers
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

      // Password change reducers
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
      })

      // Survey reducers
      .addCase(getSurvey.pending, (state) => {
        state.surveys.loading = true;
        state.surveys.error = null;
      })
      .addCase(getSurvey.fulfilled, (state, action) => {
        state.surveys.loading = false;
        state.surveys.data = action.payload.data;
      })
      .addCase(getSurvey.rejected, (state, action) => {
        state.surveys.loading = false;
        state.surveys.error =
          action.payload?.message || "Failed to fetch surveys";
      })
      .addCase(fetchSurveyDetails.pending, (state) => {
        state.currentSurvey.loading = true;
        state.currentSurvey.error = null;
      })
      .addCase(fetchSurveyDetails.fulfilled, (state, action) => {
        state.currentSurvey.loading = false;
        state.currentSurvey.data = action.payload;
        state.currentSurvey.error = null;
      })
      .addCase(fetchSurveyDetails.rejected, (state, action) => {
        state.currentSurvey.loading = false;
        state.currentSurvey.error =
          action.payload?.message || "Failed to fetch survey details";
      })
      .addCase(submitSurveyResponses.pending, (state) => {
        state.currentSurvey.submissionStatus = "submitting";
        state.currentSurvey.error = null;
      })
      .addCase(submitSurveyResponses.fulfilled, (state, action) => {
        state.currentSurvey.submissionStatus = "succeeded";
        state.message =
          action.payload.message || "Survey submitted successfully";
        state.currentSurvey.error = null;
      })
      .addCase(submitSurveyResponses.rejected, (state, action) => {
        state.currentSurvey.submissionStatus = "failed";
        state.currentSurvey.error =
          action.payload?.message || "Failed to submit survey";
      });
  },
});

export const {
  clearMessage,
  resetPasswordChangeStatus,
  setSortBy,
  setSortOrder,
  clearSurveyErrors,
  resetSubmissionStatus,
} = userSlice.actions;

export const selectSurveys = (state) => state.user.surveys.data.surveys;
export const selectSurveyPagination = (state) =>
  state.user.surveys.data.pagination;
export const selectSurveyLoading = (state) => state.user.surveys.loading;
export const selectSurveyError = (state) => state.user.surveys.error;
export const selectSortBy = (state) => state.user.surveys.sortBy;
export const selectSortOrder = (state) => state.user.surveys.sortOrder;

export const selectCurrentSurvey = (state) => state.user.currentSurvey.data;
export const selectCurrentSurveyLoading = (state) =>
  state.user.currentSurvey.loading;
export const selectCurrentSurveyError = (state) =>
  state.user.currentSurvey.error;
export const selectSubmissionStatus = (state) =>
  state.user.currentSurvey.submissionStatus;

export default userSlice.reducer;
