import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
    fetchMovements,
    fetchLowStock,
    selectMovements,
    selectLowStockProducts,
    selectLowStockVariants,
    selectInventoryStatus,
} from "../features/inventory/inventorySlice";
import { selectCurrentUser } from "../features/auth/authSlice";

const Inventory = () => {
    const dispatch = useAppDispatch();
    const movements = useAppSelector(selectMovements);
    const lowStockProducts = useAppSelector(selectLowStockProducts);
    const lowStockVariants = useAppSelector(selectLowStockVariants);
    const status = useAppSelector(selectInventoryStatus);
    const currentUser = useAppSelector(selectCurrentUser);

    const [threshold, setThreshold] = useState(10);

    useEffect(() => {
        if (currentUser?.is_superuser) {
            dispatch(fetchMovements());
            dispatch(fetchLowStock(threshold));
        }
    }, [dispatch, currentUser, threshold]);

    if (!currentUser?.is_superuser) {
        return (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Bu sayfa yalnızca <strong>admin</strong> kullanıcılar için erişilebilir.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Envanter Yönetimi</h2>
                <p className="text-sm text-slate-500">Stok hareketleri ve düşük stok uyarıları</p>
            </div>

            {/* Low Stock Alert */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">Düşük Stok Uyarısı</h3>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600">Eşik:</label>
                        <input
                            type="number"
                            min="0"
                            value={threshold}
                            onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                            className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                        />
                    </div>
                </div>

                {(lowStockProducts.length > 0 || lowStockVariants.length > 0) ? (
                    <div className="space-y-4">
                        {lowStockProducts.length > 0 && (
                            <div>
                                <h4 className="text-xs font-medium text-red-600 mb-2">Ürünler ({lowStockProducts.length})</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {lowStockProducts.map((p) => (
                                        <div key={p.id} className="p-2 bg-red-50 rounded-lg border border-red-200">
                                            <div className="text-sm font-medium text-slate-800">{p.name}</div>
                                            <div className="text-xs text-red-600">Stok: {p.stock}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {lowStockVariants.length > 0 && (
                            <div>
                                <h4 className="text-xs font-medium text-orange-600 mb-2">Varyantlar ({lowStockVariants.length})</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {lowStockVariants.map((v) => (
                                        <div key={v.id} className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="text-sm font-medium text-slate-800">{v.name}</div>
                                            <div className="text-xs text-orange-600">Stok: {v.stock}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">Düşük stoklu ürün bulunmuyor.</p>
                )}
            </div>

            {/* Stock Movements */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800">Son Stok Hareketleri</h3>
                </div>
                {status === "loading" ? (
                    <div className="p-4 text-sm text-slate-500">Yükleniyor...</div>
                ) : (
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-medium uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Tarih</th>
                                <th className="px-4 py-3">Değişim</th>
                                <th className="px-4 py-3">Sebep</th>
                                <th className="px-4 py-3">Ürün/Varyant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {movements.slice(0, 20).map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 text-xs text-slate-500">
                                        {new Date(m.created_at).toLocaleString("tr-TR")}
                                    </td>
                                    <td className={`px-4 py-2 font-medium ${m.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {m.change >= 0 ? "+" : ""}{m.change}
                                    </td>
                                    <td className="px-4 py-2 text-slate-700">{m.reason}</td>
                                    <td className="px-4 py-2 text-xs text-slate-500">
                                        {m.product_id?.slice(0, 8) || m.variant_id?.slice(0, 8) || "-"}
                                    </td>
                                </tr>
                            ))}
                            {movements.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                                        Henüz hareket yok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Inventory;
