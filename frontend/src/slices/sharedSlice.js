import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosConfig";

export const getWallet = createAsyncThunk(
  "shared/getWallet",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/wallet`);
      return response.data.wallet === null ? null : response.data.wallet;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const createWallet = createAsyncThunk(
  "shared/createWallet",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(`/wallet`);
      return response.data.publicAddress;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const addExistingWallet = createAsyncThunk(
  "shared/addExistingWallet",
  async (walletDetails, { rejectWithValue }) => {
    try {
      const response = await api.post(`/addWallet`, walletDetails);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : "Failed to add wallet"
      );
    }
  }
);

export const getWalletTransactions = createAsyncThunk(
  "shared/getWalletTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/wallet/transactions`);
      return response.data.transactions;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : "Failed to fetch wallet transactions"
      );
    }
  }
);

export const postWalletTransactions = createAsyncThunk(
  "shared/postWalletTransactions",
  async (transactionDetails, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/wallet/transactions`,
        transactionDetails
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data
          ? error.response.data.message
          : "Failed to post wallet transactions"
      );
    }
  }
);

const initialState = {
  wallet: {
    loading: false,
    error: null,
    data: null,
    transactions: {
      loading: false,
      data: [],
      error: null,
    },
  },
};

const sharedSlice = createSlice({
  name: "shared",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getWallet.pending, (state) => {
        state.wallet.loading = true;
        state.wallet.error = null;
      })
      .addCase(getWallet.fulfilled, (state, action) => {
        state.wallet.loading = false;
        state.wallet.data = action.payload;
      })
      .addCase(getWallet.rejected, (state, action) => {
        state.wallet.loading = false;
        state.wallet.error = action.payload || "Failed to fetch wallet data";
      })
      .addCase(addExistingWallet.pending, (state) => {
        state.wallet.loading = true;
        state.wallet.error = null;
      })
      .addCase(addExistingWallet.fulfilled, (state, action) => {
        state.wallet.loading = false;
        state.wallet.data = action.payload;
        state.wallet.error = null;
      })
      .addCase(addExistingWallet.rejected, (state, action) => {
        state.wallet.loading = false;
        state.wallet.error = action.payload || "Failed to add wallet";
      })
      .addCase(getWalletTransactions.pending, (state) => {
        state.wallet.transactions.loading = true;
        state.wallet.transactions.error = null;
      })
      .addCase(getWalletTransactions.fulfilled, (state, action) => {
        state.wallet.transactions.loading = false;
        state.wallet.transactions.data = action.payload;
      })
      .addCase(getWalletTransactions.rejected, (state, action) => {
        state.wallet.transactions.loading = false;
        state.wallet.transactions.error =
          action.payload || "Failed to fetch wallet transactions";
      });
  },
});

export const selectWalletData = (state) => state.shared.wallet.data;
export const selectWalletLoading = (state) => state.shared.wallet.loading;
export const selectWalletError = (state) => state.shared.wallet.error;

export const selectWalletTransactions = (state) =>
  state.shared.wallet.transactions.data;
export const selectWalletTransactionsLoading = (state) =>
  state.shared.wallet.transactions.loading;
export const selectWalletTransactionsError = (state) =>
  state.shared.wallet.transactions.error;

export default sharedSlice.reducer;
