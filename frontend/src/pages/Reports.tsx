import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
    fetchSalesData,
    fetchTopProducts,
    selectSalesData,
    selectTopProducts,
    selectReportsStatus,
} from "../features/reports/reportsSlice";
import { selectCurrentUser } from "../features/auth/authSlice";

const Reports = () => {
    const dispatch = useAppDispatch();
    const salesData = useAppSelector(selectSalesData);
    const topProducts = useAppSelector(selectTopProducts);
    const status = useAppSelector(selectReportsStatus);
    const currentUser = useAppSelector(selectCurrentUser);

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [groupBy, setGroupBy] = useState("day");

    useEffect(() => {
        if (currentUser?.is_superuser && startDate && endDate) {
            dispatch(fetchSalesData({ startDate, endDate, groupBy }));
            dispatch(fetchTopProducts({ startDate, endDate, limit: 10 }));
        }
    }, [dispatch, currentUser, startDate, endDate, groupBy]);

    if (!currentUser?.is_superuser) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Bu sayfa yalnızca <strong>admin</strong> kullanıcılar için erişilebilir.
            </div>
        );
    }

    const maxRevenue = Math.max(...salesData.map((d) => d.revenue), 1);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Raporlar</h2>
                <p className="text-sm text-slate-500">Satış trendleri ve en çok satan ürünler</p>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Başlangıç</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Bitiş</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Gruplama</label>
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                    >
                        <option value="day">Günlük</option>
                        <option value="week">Haftalık</option>
                        <option value="month">Aylık</option>
                    </select>
                </div>
            </div>

            {/* Sales Trend Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Satış Trendi</h3>
                {status === "loading" ? (
                    <div className="h-48 flex items-center justify-center text-slate-500">Yükleniyor...</div>
                ) : salesData.length > 0 ? (
                    <div className="h-48 flex items-end gap-1">
                        {salesData.map((d, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors relative group"
                                style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: "4px" }}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                    {d.date}: {d.revenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                    <br />
                                    {d.order_count} sipariş
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center text-slate-500">Veri yok</div>
                )}
                {salesData.length > 0 && (
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>{salesData[0]?.date}</span>
                        <span>{salesData[salesData.length - 1]?.date}</span>
                    </div>
                )}
            </div>

            {/* Top Products */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800">En Çok Satan Ürünler</h3>
                </div>
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Ürün</th>
                            <th className="px-4 py-3">Toplam Ciro</th>
                            <th className="px-4 py-3">Satış Adedi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {topProducts.map((p, i) => (
                            <tr key={p.product_id} className="hover:bg-slate-50">
                                <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                                <td className="px-4 py-2 font-medium text-slate-800">{p.product_name}</td>
                                <td className="px-4 py-2 text-slate-700">
                                    {p.total_revenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                                </td>
                                <td className="px-4 py-2 text-slate-700">{p.total_quantity}</td>
                            </tr>
                        ))}
                        {topProducts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                                    Veri yok
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
