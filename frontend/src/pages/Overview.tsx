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
    dispatch(clearAuth());              // redux + localStorage temizlenir
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Üst satır: başlık + logout */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
          <p className="text-sm text-slate-400">
            Genel metrikler ve özetler burada yer alacak.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-red-500/70 bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-100 transition-colors hover:bg-red-600 hover:text-red-50"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Giriş yapan kullanıcı kartı */}
      {user && (
        <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-slate-500/60 p-4 text-white">
          <div>
            <p className="text-xs opacity-80">Giriş yapan kullanıcı</p>
            <p className="text-base font-medium">
              {user.full_name || user.email}
            </p>
          </div>
        </div>
      )}

      {/* Metrik kartları */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-300 bg-slate-500/60 p-4 text-white">
          <p className="text-xs opacity-80">Toplam Ciro</p>
          <p className="mt-1 text-2xl font-semibold">₺0</p>
          <p className="mt-1 text-xs opacity-70">
            Dashboard metrikleri eklendiğinde güncellenecek.
          </p>
        </div>
        <div className="rounded-xl border border-slate-300 bg-slate-500/60 p-4 text-white">
          <p className="text-xs opacity-80">Toplam Sipariş</p>
          <p className="mt-1 text-2xl font-semibold">0</p>
        </div>
        <div className="rounded-xl border border-slate-300 bg-slate-500/60 p-4 text-white">
          <p className="text-xs opacity-80">Aktif Kullanıcılar</p>
          <p className="mt-1 text-2xl font-semibold">0</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;