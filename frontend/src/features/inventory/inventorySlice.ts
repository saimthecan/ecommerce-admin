// src/features/inventory/inventorySlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { apiClient } from "../../api/client";
import type { RootState } from "../../app/store";

export type InventoryMovement = {
    id: string;
    product_id: string | null;
    variant_id: string | null;
    change: number;
    reason: string;
    ref_order_id: string | null;
    notes: string | null;
    created_at: string;
};

export type LowStockItem = {
    id: string;
    name: string;
    stock: number;
    is_active: boolean;
};

type InventoryState = {
    movements: InventoryMovement[];
    lowStockProducts: LowStockItem[];
    lowStockVariants: LowStockItem[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
};

const initialState: InventoryState = {
    movements: [],
    lowStockProducts: [],
    lowStockVariants: [],
    status: "idle",
    error: null,
};

export const fetchMovements = createAsyncThunk<
    InventoryMovement[],
    void,
    { rejectValue: string }
>("inventory/fetchMovements", async (_, { rejectWithValue }) => {
    try {
        const res = await apiClient.get<InventoryMovement[]>("/inventory/movements");
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        return rejectWithValue(error.response?.data?.detail ?? "Hata oluştu");
    }
});

export const fetchLowStock = createAsyncThunk<
    { products: LowStockItem[]; variants: LowStockItem[] },
    number,
    { rejectValue: string }
>("inventory/fetchLowStock", async (threshold, { rejectWithValue }) => {
    try {
        const res = await apiClient.get(`/inventory/low-stock?threshold=${threshold}`);
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        return rejectWithValue(error.response?.data?.detail ?? "Hata oluştu");
    }
});

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovements.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchMovements.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.movements = action.payload;
            })
            .addCase(fetchMovements.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Hata";
            });

        builder
            .addCase(fetchLowStock.fulfilled, (state, action) => {
                state.lowStockProducts = action.payload.products;
                state.lowStockVariants = action.payload.variants;
            });
    },
});

export default inventorySlice.reducer;

export const selectMovements = (state: RootState) => state.inventory.movements;
export const selectLowStockProducts = (state: RootState) => state.inventory.lowStockProducts;
export const selectLowStockVariants = (state: RootState) => state.inventory.lowStockVariants;
export const selectInventoryStatus = (state: RootState) => state.inventory.status;
