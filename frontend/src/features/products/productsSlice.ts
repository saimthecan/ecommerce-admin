// src/features/products/productsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { apiClient } from "../../api/client";
import type { RootState } from "../../app/store";

// Backend'den dönen Product şekli
export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

type ProductsState = {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
};

// ───────────────── fetchProducts (liste) ─────────────────

export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>("products/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Product[]>("/products");
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Ürünler alınırken hata oluştu";
    return rejectWithValue(msg);
  }
});

// ───────────────── createProduct (ekleme) ─────────────────

export type CreateProductPayload = {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  is_active?: boolean;
  category_id?: string | null;
};

export const createProduct = createAsyncThunk<
  Product,
  CreateProductPayload,
  { rejectValue: string }
>("products/createProduct", async (data, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<Product>("/products", data);
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Ürün oluşturulurken hata oluştu";
    return rejectWithValue(msg);
  }
});

// ───────────────── updateProduct (güncelleme) ─────────────────

export type UpdateProductPayload = {
  id: string;
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  is_active?: boolean;
  category_id?: string | null;
};

export const updateProduct = createAsyncThunk<
  Product,
  UpdateProductPayload,
  { rejectValue: string }
>("products/updateProduct", async ({ id, ...body }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put<Product>(`/products/${id}`, body);
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Ürün güncellenirken hata oluştu";
    return rejectWithValue(msg);
  }
});

// ───────────────── deleteProduct (silme) ─────────────────

export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("products/deleteProduct", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/products/${id}`);
    return id;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Ürün silinirken hata oluştu";
    return rejectWithValue(msg);
  }
});

// ───────────────── slice ─────────────────

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Ürün listesi alınamadı";
      });

    // create
    builder
      .addCase(createProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.payload ?? "Ürün oluşturulamadı";
      });

    // update
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((p) => p.id === updated.id);
        if (idx !== -1) {
          state.items[idx] = updated;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload ?? "Ürün güncellenemedi";
      });

    // delete
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((p) => p.id !== id);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload ?? "Ürün silinemedi";
      });
  },
});

export default productsSlice.reducer;

// ───────────────── selectors ─────────────────

export const selectProducts = (state: RootState) => state.products.items;
export const selectProductsStatus = (state: RootState) =>
  state.products.status;
export const selectProductsError = (state: RootState) =>
  state.products.error;