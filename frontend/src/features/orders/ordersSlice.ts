// src/features/orders/ordersSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { apiClient } from "../../api/client";
import type { RootState } from "../../app/store";

export type OrderItem = {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    created_at: string;
};

export type Order = {
    id: string;
    user_id: string | null;
    status: string;
    total_amount: number;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
};

type OrdersState = {
    items: Order[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
};

const initialState: OrdersState = {
    items: [],
    status: "idle",
    error: null,
};

export const fetchOrders = createAsyncThunk<
    Order[],
    void,
    { rejectValue: string }
>("orders/fetchOrders", async (_, { rejectWithValue }) => {
    try {
        const res = await apiClient.get<Order[]>("/orders");
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        const msg =
            error.response?.data?.detail ??
            error.message ??
            "Siparişler alınırken hata oluştu";
        return rejectWithValue(msg);
    }
});

export type CreateOrderPayload = {
    user_id?: string | null;
    status?: string;
    items: { product_id: string; quantity: number }[];
};

export const createOrder = createAsyncThunk<
    Order,
    CreateOrderPayload,
    { rejectValue: string }
>("orders/createOrder", async (data, { rejectWithValue }) => {
    try {
        const res = await apiClient.post<Order>("/orders", data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        const msg =
            error.response?.data?.detail ??
            error.message ??
            "Sipariş oluşturulurken hata oluştu";
        return rejectWithValue(msg);
    }
});

export type UpdateOrderStatusPayload = {
    id: string;
    status: string;
};

export const updateOrderStatus = createAsyncThunk<
    Order,
    UpdateOrderStatusPayload,
    { rejectValue: string }
>("orders/updateOrderStatus", async ({ id, status }, { rejectWithValue }) => {
    try {
        const res = await apiClient.put<Order>(`/orders/${id}/status`, { status });
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        const msg =
            error.response?.data?.detail ??
            error.message ??
            "Sipariş durumu güncellenirken hata oluştu";
        return rejectWithValue(msg);
    }
});

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        clearOrdersState: (state) => {
            state.items = [];
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Sipariş listesi alınamadı";
            });

        builder
            .addCase(createOrder.pending, (state) => {
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.error = action.payload ?? "Sipariş oluşturulamadı";
            });

        builder
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.items.findIndex((o) => o.id === updated.id);
                if (idx !== -1) {
                    state.items[idx] = updated;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.error = action.payload ?? "Sipariş durumu güncellenemedi";
            });
    },
});

export const { clearOrdersState } = ordersSlice.actions;
export default ordersSlice.reducer;

export const selectOrders = (state: RootState) => state.orders.items;
export const selectOrdersStatus = (state: RootState) => state.orders.status;
export const selectOrdersError = (state: RootState) => state.orders.error;
