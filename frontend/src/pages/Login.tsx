// src/pages/Login.tsx
import { useEffect, useState, type FormEvent } from "react";
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

  const [warmingUp, setWarmingUp] = useState(false);
  const [warmupError, setWarmupError] = useState<string | null>(null);
  const [warmupSuccess, setWarmupSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/overview", { replace: true });
    }
  };

  useEffect(() => {
    if (!warmupSuccess) {
      return;
    }

    const timer = window.setTimeout(() => {
      setWarmupSuccess(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [warmupSuccess]);

  const handleWarmup = async () => {
    if (warmingUp) {
      return;
    }

    setWarmingUp(true);
    setWarmupError(null);
    setWarmupSuccess(false);

    try {
      const response = await fetch("/api/warmup", {
        method: "POST",
        cache: "no-store",
      });
      const contentType = response.headers.get("content-type") ?? "";
      const bodyText = await response.text();

      if (!response.ok) {
        if (contentType.includes("application/json") && bodyText) {
          try {
            const parsed = JSON.parse(bodyText) as { error?: string };
            if (parsed?.error) {
              throw new Error(parsed.error);
            }
          } catch {
            // ignore JSON parse errors and fall back to bodyText
          }
        }
        throw new Error(bodyText || `HTTP ${response.status}`);
      }

      setWarmupSuccess(true);
    } catch (error) {
      setWarmupError(error instanceof Error ? error.message : String(error));
    } finally {
      setWarmingUp(false);
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-7 shadow-xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700" />
            <span className="text-xs font-semibold tracking-wide text-slate-300">
              Ecommerce Admin
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-50">
            Admin Girişi
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Dev için{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px]">
              admin@example.com
            </code>{" "}
            /{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px]">
              admin123
            </code>{" "}
            kullanabilirsin.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/50 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1"
              placeholder="admin@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/50 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
          <button
            type="button"
            title="Render + Neon uyandırır"
            onClick={handleWarmup}
            disabled={warmingUp}
            className={[
              "w-full rounded-lg px-3 py-2 text-sm font-medium transition",
              warmingUp
                ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-slate-800 text-slate-100 hover:bg-slate-700",
            ].join(" ")}
          >
            {warmingUp ? "Uyandırılıyor…" : "Sistemi uyandır"}
          </button>
          {warmingUp && (
            <p className="text-[11px] leading-snug text-slate-400">
              Sistemin uyanması yaklaşık 1 dk sürebilir. Uyanmazsa butona tekrar basıp bir daha deneyin.
            </p>
          )}
          {warmupSuccess && (
            <p className="text-xs text-emerald-300">Sistem uyandı ✅</p>
          )}
          {warmupError && (
            <p className="text-xs text-rose-300">{warmupError}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
