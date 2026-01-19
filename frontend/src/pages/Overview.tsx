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

const STATUS_LABELS: { key: string; label: string }[] = [
  { key: "paid", label: "Paid" },
  { key: "pending", label: "Pending" },
  { key: "cancelled", label: "Cancelled" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const Overview = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const stats = useAppSelector(selectOverviewStats);
  const statsStatus = useAppSelector(selectOverviewStatus);
  const statsError = useAppSelector(selectOverviewError);

  useEffect(() => {
    dispatch(fetchOverviewStats());
  }, [dispatch]);

  const formatCurrency = (value: number | undefined) =>
    (value ?? 0).toLocaleString("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 2,
    });

  const ordersByStatus = stats?.orders_by_status ?? {};

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Genel metrikler ve özetler burada yer alacak.
        </p>
      </div>

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

      {statsError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          İstatistikler yüklenirken hata: {statsError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Toplam Ciro
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(stats?.total_revenue)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Ödendi/Kargoda/Teslim edildi siparişlerden hesaplanır.
          </p>
        </div>

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

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            Sipariş Durum Dağılımı
          </h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STATUS_LABELS.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {item.label}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-800">
                {ordersByStatus[item.key] ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
