import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  loginUser,
  selectAuthError,
  selectAuthStatus,
} from "../features/auth/authSlice";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/overview");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            style={{ width: "100%" }}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Şifre</label>
          <input
            type="password"
            value={password}
            style={{ width: "100%" }}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;