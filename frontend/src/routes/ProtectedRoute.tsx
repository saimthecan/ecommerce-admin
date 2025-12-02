// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectCurrentUser } from "../features/auth/authSlice";

type ProtectedRouteProps = {
  redirectTo?: string;
};

const ProtectedRoute = ({ redirectTo = "/login" }: ProtectedRouteProps) => {
  const user = useAppSelector(selectCurrentUser);

  if (!user) {
    // Kullanıcı yoksa login sayfasına at
    return <Navigate to={redirectTo} replace />;
  }

  // Kullanıcı varsa, alt route'u render et
  return <Outlet />;
};

export default ProtectedRoute;
