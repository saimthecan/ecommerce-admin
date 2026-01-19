// src/features/addresses/addressesSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { apiClient } from "../../api/client";
import type { RootState } from "../../app/store";

export type Address = {
    id: string;
    user_id: string;
    name: string;
    phone: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postal_code: string;
    country: string;
    is_default: string;
    created_at: string;
    updated_at: string;
};

type AddressesState = {
    items: Address[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
};

const initialState: AddressesState = {
    items: [],
    status: "idle",
    error: null,
};

export const fetchAddresses = createAsyncThunk<
    Address[],
    void,
    { rejectValue: string }
>("addresses/fetchAddresses", async (_, { rejectWithValue }) => {
    try {
        const res = await apiClient.get<Address[]>("/addresses");
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        return rejectWithValue(error.response?.data?.detail ?? "Hata oluştu");
    }
});

export type CreateAddressPayload = {
    name: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country?: string;
};

export const createAddress = createAsyncThunk<
    Address,
    CreateAddressPayload,
    { rejectValue: string }
>("addresses/createAddress", async (data, { rejectWithValue }) => {
    try {
        const res = await apiClient.post<Address>("/addresses", data);
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        return rejectWithValue(error.response?.data?.detail ?? "Hata oluştu");
    }
});

export const deleteAddress = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("addresses/deleteAddress", async (id, { rejectWithValue }) => {
    try {
        await apiClient.delete(`/addresses/${id}`);
        return id;
    } catch (err) {
        const error = err as AxiosError<{ detail?: string }>;
        return rejectWithValue(error.response?.data?.detail ?? "Hata oluştu");
    }
});

const addressesSlice = createSlice({
    name: "addresses",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddresses.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Hata";
            });

        builder
            .addCase(createAddress.fulfilled, (state, action) => {
                state.items.push(action.payload);
            });

        builder
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.items = state.items.filter((a) => a.id !== action.payload);
            });
    },
});

export default addressesSlice.reducer;

export const selectAddresses = (state: RootState) => state.addresses.items;
export const selectAddressesStatus = (state: RootState) => state.addresses.status;
