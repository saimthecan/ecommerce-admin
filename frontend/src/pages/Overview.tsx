// src/pages/Overview.tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectCurrentUser } from "../features/auth/authSlice";
import {
  fetchOverviewStats,
  selectOverviewStats,
  selectOverviewStatus,
  selectOverviewError,
} from "../features/stats/statsSlice";

const Overview = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const stats = useAppSelector(selectOverviewStats);
  const statsStatus = useAppSelector(selectOverviewStatus);
  const statsError = useAppSelector(selectOverviewError);

  useEffect(() => {
    if (statsStatus === "idle") {
      dispatch(fetchOverviewStats());
    }
  }, [statsStatus, dispatch]);

  const formatCurrency = (value: number | undefined) =>
    (value ?? 0).toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Genel metrikler ve özetler burada yer alacak.
        </p>
      </div>

      {/* Giriş yapan kullanıcı alanı */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-800 px-4 py-3 text-sm text-slate-100 shadow-sm sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Giriş yapan kullanıcı
          </p>
          <p className="mt-1 text-sm font-medium">
            {user?.full_name || user?.email}
          </p>
        </div>
      </div>

      {/* Hata mesajı */}
      {statsError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          İstatistikler yüklenirken hata: {statsError}
        </div>
      )}

      {/* Kartlar */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Toplam Ciro */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Toplam Ciro
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(stats?.total_revenue)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            İptal edilen siparişler hariç hesaplanır.
          </p>
        </div>

        {/* Toplam Sipariş */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Toplam Sipariş
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {stats?.total_orders ?? 0}
          </p>
          {statsStatus === "loading" && (
            <p className="mt-1 text-xs text-slate-400">Yükleniyor...</p>
          )}
        </div>

        {/* Aktif Kullanıcılar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Aktif Kullanıcılar
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {stats?.active_users ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Sadece <code>is_active = true</code> kullanıcılar sayılır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
