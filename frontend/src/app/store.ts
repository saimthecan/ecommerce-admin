import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import usersReducer from "../features/users/usersSlice";
import productsReducer from "../features/products/productsSlice";
import statsReducer from "../features/stats/statsSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    products:productsReducer,
    stats: statsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;