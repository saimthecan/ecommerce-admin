// src/features/reports/reportsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { apiClient } from "../../api/client";
import type { RootState } from "../../app/store";

export type SalesDataPoint = {
    date: string;
    revenue: number;
    order_count: number;
};

export type TopProduct = {
    product_id: string;
    product_name: string;
    total_revenue: number;
    total_quantity: number;
};

type ReportsState = {
    salesData: SalesDataPoint[];
    topProducts: TopProduct[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
};

const initialState: ReportsState = {
    salesData: [],
    topProducts: [],
    status: "idle",
    error: null,
};

export const fetchSalesData = createAsyncThunk<
    SalesDataPoint[],
    { startDate: string; endDate: string; groupBy: string },
    { rejectValue: string }
>("reports/fetchSalesData", async ({ startDate, endDate, groupBy }, { rejectWithValue }) => {
    try {
        const res = await apiClient.get<SalesDataPoint[]>(
            `/stats/sales?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}`
        );
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        return rejectWithValue(error.response?.data?.detail ?? "Hata oluştu");
    }
});

export const fetchTopProducts = createAsyncThunk<
    TopProduct[],
    { startDate?: string; endDate?: string; limit?: number },
    { rejectValue: string }
>("reports/fetchTopProducts", async ({ startDate, endDate, limit = 10 }, { rejectWithValue }) => {
    try {
        let url = `/stats/top-products?limit=${limit}`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;
        const res = await apiClient.get<TopProduct[]>(url);
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        return rejectWithValue(error.response?.data?.detail ?? "Hata oluştu");
    }
});

const reportsSlice = createSlice({
    name: "reports",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSalesData.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchSalesData.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.salesData = action.payload;
            })
            .addCase(fetchSalesData.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Hata";
            });

        builder
            .addCase(fetchTopProducts.fulfilled, (state, action) => {
                state.topProducts = action.payload;
            });
    },
});

export default reportsSlice.reducer;

export const selectSalesData = (state: RootState) => state.reports.salesData;
export const selectTopProducts = (state: RootState) => state.reports.topProducts;
export const selectReportsStatus = (state: RootState) => state.reports.status;
