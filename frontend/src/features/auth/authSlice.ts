import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../../api/client";
import type { AuthState, User } from "./types";
import type { RootState } from "../../app/store";

const LOCAL_STORAGE_KEY = "auth";

// JWT exp kontrolü
function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson) as { exp?: number };
    if (!decoded.exp) return true;
    const expMs = decoded.exp * 1000;
    return Date.now() >= expMs;
  } catch {
    return true;
  }
}

function loadFromStorage(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return { user: null, token: null };

    const parsed = JSON.parse(raw) as { user: User; token: string };
    if (!parsed.token || isTokenExpired(parsed.token)) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return { user: null, token: null };
    }
    return parsed;
  } catch {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return { user: null, token: null };
  }
}

const persisted = loadFromStorage();

const initialState: AuthState = {
  user: persisted.user,
  token: persisted.token,
  status: "idle",
  error: null,
};

// LOGIN thunk: /auth/login + /users/me
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (payload, { rejectWithValue }) => {
  try {
    // 1) token al
    const loginRes = await apiClient.post("/auth/login", {
      email: payload.email,
      password: payload.password,
    });

    const token: string = loginRes.data.access_token;

    // 2) token ile /users/me çağır
    const meRes = await apiClient.get<User>("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = meRes.data;

    const authData = { user, token };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authData));

    return authData;
  } catch (err) {
  console.error("Login error:", err);
  return rejectWithValue("E-posta veya şifre hatalı");
}
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.status = "succeeded";
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Giriş sırasında bir hata oluştu";
      });
  },
});

export const { clearAuth } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;