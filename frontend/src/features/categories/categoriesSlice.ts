// src/features/categories/categoriesSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { apiClient } from "../../api/client";
import type { RootState } from "../../app/store";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

interface CategoriesState {
  items: Category[];
  status: Status;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<Category[]>("/categories");
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Kategoriler alınırken hata oluştu";
    return rejectWithValue(msg);
  }
});

export type CreateCategoryPayload = {
  name: string;
  description?: string | null;
};

export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryPayload,
  { rejectValue: string }
>("categories/createCategory", async (data, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<Category>("/categories", data);
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Kategori oluşturulurken hata oluştu";
    return rejectWithValue(msg);
  }
});

export type UpdateCategoryPayload = {
  id: string;
  name?: string;
  description?: string | null;
};

export const updateCategory = createAsyncThunk<
  Category,
  UpdateCategoryPayload,
  { rejectValue: string }
>("categories/updateCategory", async ({ id, ...body }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put<Category>(`/categories/${id}`, body);
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Kategori güncellenirken hata oluştu";
    return rejectWithValue(msg);
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("categories/deleteCategory", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/categories/${id}`);
    return id;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Kategori silinirken hata oluştu";
    return rejectWithValue(msg);
  }
});

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Kategori listesi alınamadı";
      });

    // create
    builder
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload ?? "Kategori oluşturulamadı";
      });

    // update
    builder
      .addCase(updateCategory.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((c) => c.id === updated.id);
        if (idx !== -1) {
          state.items[idx] = updated;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload ?? "Kategori güncellenemedi";
      });

    // delete
    builder
      .addCase(deleteCategory.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((c) => c.id !== id);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload ?? "Kategori silinemedi";
      });
  },
});

export default categoriesSlice.reducer;

export const selectCategories = (state: RootState) => state.categories.items;
export const selectCategoriesStatus = (state: RootState) =>
  state.categories.status;
export const selectCategoriesError = (state: RootState) =>
  state.categories.error;