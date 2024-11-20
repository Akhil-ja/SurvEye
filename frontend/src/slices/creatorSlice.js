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

export const createSurvey = createAsyncThunk(
  "creator/createSurvey",
  async (surveyData, { rejectWithValue }) => {
    try {
      const response = await api.post("creator/survey", surveyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create survey" }
      );
    }
  }
);

export const getSurvey = createAsyncThunk(
  "creator/getSurvey",
  async ({ surveyId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`creator/survey?surveyId=${surveyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch survey" }
      );
    }
  }
);

export const getAllSurveys = createAsyncThunk(
  "creator/getAllSurveys",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/creator/surveys");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch surveys" }
      );
    }
  }
);

export const submitSurvey = createAsyncThunk(
  "creator/submitSurvey",
  async ({ surveyData, actionType, price }) => {
    const response = await api.post(`creator/createsurvey`, {
      ...surveyData,
      actionType,
      price,
    });
    return response.data;
  }
);

export const publishSurvey = createAsyncThunk(
  "creator/publishSurvey",
  async (surveyId) => {
    const response = await api.put(
      `creator/publishsurvey?surveyId=${surveyId}`
    );
    return response.data;
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
    surveyCreationStatus: "idle",
    surveys: [],
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
      })
      .addCase(createSurvey.pending, (state) => {
        state.surveyCreationStatus = "loading";
      })
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.surveyCreationStatus = "succeeded";
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(createSurvey.rejected, (state, action) => {
        state.surveyCreationStatus = "failed";
        state.error = action.payload?.message || "Failed to create survey";
      })
      .addCase(getSurvey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSurvey.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getSurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitSurvey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitSurvey.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitSurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getAllSurveys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllSurveys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.surveys = action.payload;
        state.error = null;
      })
      .addCase(getAllSurveys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch surveys";
      });
  },
});

export const {
  clearMessage,
  resetPasswordChangeStatus,
  resetSurveyCreationStatus,
} = creatorSlice.actions;
export default creatorSlice.reducer;
