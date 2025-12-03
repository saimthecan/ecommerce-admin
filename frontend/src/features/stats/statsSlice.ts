// src/features/stats/statsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { apiClient } from "../../api/client";
import type { AxiosError } from "axios";

export type OverviewStats = {
  total_revenue: number;
  total_orders: number;
  active_users: number;
  active_products: number;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

interface StatsState {
  overview: OverviewStats | null;
  status: Status;
  error: string | null;
}

const initialState: StatsState = {
  overview: null,
  status: "idle",
  error: null,
};

export const fetchOverviewStats = createAsyncThunk<
  OverviewStats,
  void,
  { rejectValue: string }
>("stats/fetchOverview", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<OverviewStats>("/stats/overview");
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Özet istatistikler alınırken hata oluştu";
    return rejectWithValue(msg);
  }
});

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverviewStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOverviewStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.overview = action.payload;
      })
      .addCase(fetchOverviewStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Bilinmeyen hata";
      });
  },
});

export default statsSlice.reducer;

export const selectOverviewStats = (state: RootState) => state.stats.overview;
export const selectOverviewStatus = (state: RootState) => state.stats.status;
export const selectOverviewError = (state: RootState) => state.stats.error;