import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
    fetchOrders,
    createOrder,
    updateOrderStatus,
    selectOrders,
    selectOrdersStatus,
    selectOrdersError,
    type Order,
} from "../features/orders/ordersSlice";
import { fetchProducts, selectProducts } from "../features/products/productsSlice";
import {
    fetchUsers,
    selectUsers,
    selectUsersStatus,
} from "../features/users/usersSlice";
import { selectCurrentUser } from "../features/auth/authSlice";

const STATUS_OPTIONS = ["pending", "paid", "cancelled", "shipped", "delivered"];

const Orders = () => {
    const dispatch = useAppDispatch();
    const orders = useAppSelector(selectOrders);
    const status = useAppSelector(selectOrdersStatus);
    const error = useAppSelector(selectOrdersError);
    const currentUser = useAppSelector(selectCurrentUser);
    const products = useAppSelector(selectProducts);
    const users = useAppSelector(selectUsers);
    const usersStatus = useAppSelector(selectUsersStatus);

    const isAdmin = currentUser?.is_superuser ?? false;

    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("1");
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "idle" && currentUser) {
            dispatch(fetchOrders());
        }
    }, [status, dispatch, currentUser]);

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchProducts());
        }
    }, [dispatch, currentUser]);

    useEffect(() => {
        if (isAdmin && usersStatus === "idle") {
            dispatch(fetchUsers());
        }
    }, [dispatch, isAdmin, usersStatus]);

    const handleCreateOrder = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!selectedProductId) {
            setFormError("Lütfen bir ürün seçin.");
            return;
        }

        const qty = parseInt(quantity, 10);
        if (Number.isNaN(qty) || qty <= 0) {
            setFormError("Geçerli bir adet girin.");
            return;
        }

        const payload: Parameters<typeof createOrder>[0] = {
            items: [{ product_id: selectedProductId, quantity: qty }],
        };

        if (isAdmin && selectedUserId) {
            payload.user_id = selectedUserId;
        }

        const result = await dispatch(createOrder(payload));
        if (createOrder.fulfilled.match(result)) {
            setSelectedProductId("");
            setQuantity("1");
            setSelectedUserId("");
        }
    };

    const handleStatusChange = (order: Order, newStatus: string) => {
        dispatch(updateOrderStatus({ id: order.id, status: newStatus }));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (orderStatus: string) => {
        const styles: Record<string, string> = {
            pending: "bg-amber-50 text-amber-700 border-amber-200",
            paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
            cancelled: "bg-red-50 text-red-700 border-red-200",
            shipped: "bg-blue-50 text-blue-700 border-blue-200",
            delivered: "bg-green-50 text-green-700 border-green-200",
        };
        return styles[orderStatus] || "bg-slate-100 text-slate-700 border-slate-200";
    };

    const availableProducts = isAdmin
        ? products
        : products.filter((product) => product.is_active);

    const userLookup = useMemo(() => {
        return new Map(users.map((u) => [u.id, u.full_name ?? u.email]));
    }, [users]);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">
                    {isAdmin ? "Tüm Siparişler" : "Siparişlerim"}
                </h2>
                <p className="text-sm text-slate-500">
                    {isAdmin
                        ? "Sistemdeki tüm siparişlerin listesi ve yönetimi."
                        : "Verdiğiniz siparişlerin listesi."}
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                    Yeni Sipariş Oluştur
                </h3>
                <form
                    onSubmit={handleCreateOrder}
                    className="grid grid-cols-1 gap-3 md:grid-cols-5 items-end"
                >
                    {isAdmin && (
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Kullanıcı Seç
                            </label>
                            <select
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                            >
                                <option value="">Kendim</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.full_name ?? u.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className={isAdmin ? "md:col-span-2" : "md:col-span-3"}>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Ürün Seçin
                        </label>
                        <select
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            required
                        >
                            <option value="">Ürün seçin...</option>
                            {availableProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} -{" "}
                                    {p.price.toLocaleString("tr-TR", {
                                        style: "currency",
                                        currency: "TRY",
                                    })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Adet
                        </label>
                        <input
                            type="number"
                            min="1"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
                        >
                            {status === "loading" ? "..." : "Sipariş Ver"}
                        </button>
                    </div>
                </form>
                {formError && (
                    <p className="mt-2 text-xs text-red-600">{formError}</p>
                )}
                {error && <p className="mt-2 text-xs text-red-600">Hata: {error}</p>}
            </div>

            {status === "loading" && orders.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Siparişler yükleniyor...
                </div>
            )}

            {status === "failed" && orders.length === 0 && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Hata: {error}
                </div>
            )}

            {(status === "succeeded" || orders.length > 0) && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Sipariş ID</th>
                                {isAdmin && <th className="px-4 py-3">Kullanıcı</th>}
                                <th className="px-4 py-3">Durum</th>
                                <th className="px-4 py-3">Toplam</th>
                                <th className="px-4 py-3">Ürünler</th>
                                <th className="px-4 py-3">Tarih</th>
                                {isAdmin && <th className="px-4 py-3">İşlem</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 text-slate-800 font-mono text-xs">
                                        {order.id.slice(0, 8)}...
                                    </td>
                                    {isAdmin && (
                                        <td className="px-4 py-2 text-slate-600 text-xs">
                                            {order.user_id
                                                ? userLookup.get(order.user_id) ??
                                                  `${order.user_id.slice(0, 8)}...`
                                                : "-"}
                                        </td>
                                    )}
                                    <td className="px-4 py-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusBadge(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-slate-700">
                                        {Number(order.total_amount).toLocaleString("tr-TR", {
                                            style: "currency",
                                            currency: "TRY",
                                        })}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-600">
                                        {order.items.map((item, idx) => (
                                            <div key={item.id || idx}>
                                                {products.find((p) => p.id === item.product_id)?.name ??
                                                    item.product_id.slice(0, 8)}{" "}
                                                x{item.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-500">
                                        {formatDate(order.created_at)}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-4 py-2">
                                            <select
                                                className="rounded-md border border-slate-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                value={order.status}
                                                onChange={(e) =>
                                                    handleStatusChange(order, e.target.value)
                                                }
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {orders.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={isAdmin ? 7 : 5}
                                        className="px-4 py-6 text-center text-sm text-slate-500"
                                    >
                                        Henüz sipariş bulunmuyor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;
