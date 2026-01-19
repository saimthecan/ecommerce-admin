import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import usersReducer from "../features/users/usersSlice";
import productsReducer from "../features/products/productsSlice";
import statsReducer from "../features/stats/statsSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import ordersReducer from "../features/orders/ordersSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    products: productsReducer,
    stats: statsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;