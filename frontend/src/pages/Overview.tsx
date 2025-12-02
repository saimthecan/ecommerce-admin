import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  clearAuth,
  selectCurrentUser,
} from "../features/auth/authSlice";

const Overview = () => {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate("/login");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard Overview</h1>
      {user && (
        <p>
          Giriş yapan kullanıcı: <strong>{user.email}</strong>
        </p>
      )}
      <button onClick={handleLogout}>Çıkış Yap</button>
    </div>
  );
};

export default Overview;