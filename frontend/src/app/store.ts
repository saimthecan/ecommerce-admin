import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import usersReducer from "../features/users/usersSlice";
import productsReducer from "../features/products/productsSlice";
import statsReducer from "../features/stats/statsSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import ordersReducer from "../features/orders/ordersSlice";
import inventoryReducer from "../features/inventory/inventorySlice";
import reportsReducer from "../features/reports/reportsSlice";
import addressesReducer from "../features/addresses/addressesSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    products: productsReducer,
    stats: statsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    inventory: inventoryReducer,
    reports: reportsReducer,
    addresses: addressesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;