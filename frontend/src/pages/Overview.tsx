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
    <div className="min-h-screen bg-slate-100">
      {/* Üst bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight">Overview</h1>
            <p className="text-xs text-slate-500">
              Genel metrikler ve özetler burada yer alacak.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  Giriş yapan kullanıcı
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {user.full_name || user.email}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* İçerik */}
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        {/* Üstte geniş kart */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-700 px-4 py-3 text-slate-100 md:col-span-3">
            <p className="text-xs text-slate-300">Giriş yapan kullanıcı</p>
            <p className="text-sm font-semibold">
              {user?.full_name || user?.email || "-"}
            </p>
          </div>

          {/* Metrik kartları – şimdilik dummy */}
          <div className="rounded-xl bg-slate-700 px-4 py-4 text-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Toplam Ciro
            </p>
            <p className="mt-2 text-2xl font-semibold">₺0</p>
            <p className="mt-1 text-xs text-slate-300">
              İleride son 30 gün cirosu vs. gelecek.
            </p>
          </div>

          <div className="rounded-xl bg-slate-700 px-4 py-4 text-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Toplam Sipariş
            </p>
            <p className="mt-2 text-2xl font-semibold">0</p>
            <p className="mt-1 text-xs text-slate-300">
              Backend metrikleri bağlayınca güncellenecek.
            </p>
          </div>

          <div className="rounded-xl bg-slate-700 px-4 py-4 text-slate-100">
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Aktif Kullanıcılar
            </p>
            <p className="mt-2 text-2xl font-semibold">0</p>
            <p className="mt-1 text-xs text-slate-300">
              Kullanıcı tablosuna göre hesaplanacak.
            </p>
          </div>
        </section>

        {/* Alt aksiyonlar */}
        <section className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Kullanıcılar sayfasına git
          </button>
        </section>
      </main>
    </div>
  );
};

export default Overview;