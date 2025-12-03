// src/features/users/usersSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { apiClient } from "../../api/client";
import type { RootState } from "../../app/store";

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
};

type UsersState = {
  items: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: UsersState = {
  items: [],
  status: "idle",
  error: null,
};

export type CreateUserPayload = {
  email: string;
  full_name?: string | null;
  password: string;
};

export type UpdateUserPayload = {
  id: string;
  full_name?: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
};

// --- LİSTE ---

export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<User[]>("/users");
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;

    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Kullanıcı listesi alınırken hata oluştu";

    return rejectWithValue(msg);
  }
});

// --- YENİ KULLANICI OLUŞTURMA ---

export const createUser = createAsyncThunk<
  User,
  CreateUserPayload,
  { rejectValue: string }
>("users/createUser", async (data, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<User>("/users", data);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Kullanıcı oluşturulurken hata oluştu";
    return rejectWithValue(msg);
  }
});

// --- GÜNCELLEME (aktif/admin toggle dahil) ---

export const updateUser = createAsyncThunk<
  User,
  UpdateUserPayload,
  { rejectValue: string }
>("users/updateUser", async ({ id, ...body }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put<User>(`/users/${id}`, body);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ detail?: string }>;
    const msg =
      error.response?.data?.detail ??
      error.message ??
      "Kullanıcı güncellenirken hata oluştu";
    return rejectWithValue(msg);
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // LİSTE
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchUsers.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
        }
      )
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Kullanıcı listesi alınamadı";
      });

    // CREATE
    builder
      .addCase(createUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Kullanıcı oluşturulamadı";
      });

    // UPDATE
    builder
      .addCase(updateUser.pending, (state) => {
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((u) => u.id === updated.id);
        if (idx !== -1) {
          state.items[idx] = updated;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload ?? "Kullanıcı güncellenemedi";
      });
  },
});

export default usersSlice.reducer;

// SELECTORLER
export const selectUsers = (state: RootState) => state.users.items;
export const selectUsersStatus = (state: RootState) => state.users.status;
export const selectUsersError = (state: RootState) => state.users.error;