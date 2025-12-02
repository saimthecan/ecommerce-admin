// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Routes>
      {/* Login sadece login olmayanlara açık */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Aşağıdaki tüm rotalar login gerektirir */}
      <Route element={<ProtectedRoute />}>
        <Route path="/overview" element={<Overview />} />
        {/* İleride buraya /users, /products, /orders vs. ekleyeceğiz */}
      </Route>

      {/* Default: login ise overview'a, değilse login'e */}
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}

export default App;
