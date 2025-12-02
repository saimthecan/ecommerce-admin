// src/routes/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectCurrentUser } from "../features/auth/authSlice";

type PublicRouteProps = {
  redirectTo?: string;
};

const PublicRoute = ({ redirectTo = "/overview" }: PublicRouteProps) => {
  const user = useAppSelector(selectCurrentUser);

  if (user) {
    // Kullanıcı zaten login ise, login sayfasına gitmesin
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
