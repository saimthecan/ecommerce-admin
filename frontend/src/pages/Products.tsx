import { useEffect, useState, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  selectProducts,
  selectProductsStatus,
  selectProductsError,
  type Product,
} from "../features/products/productsSlice";
import { selectCurrentUser } from "../features/auth/authSlice";
import {
  fetchCategories,
  selectCategories,
} from "../features/categories/categoriesSlice";

const Products = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const status = useAppSelector(selectProductsStatus);
  const error = useAppSelector(selectProductsError);
  const currentUser = useAppSelector(selectCurrentUser);
  const categories = useAppSelector(selectCategories);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [stock, setStock] = useState<string>("0");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  // Sayfa açılınca ürünleri çek
  useEffect(() => {
    if (status === "idle" && currentUser?.is_superuser) {
      dispatch(fetchProducts());
    }
  }, [status, dispatch, currentUser]);

  useEffect(() => {
    if (currentUser?.is_superuser) {
      dispatch(fetchCategories());
    }
  }, [dispatch, currentUser]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    const result = await dispatch(
      createProduct({
        name,
        description: description || null,
        price: parsedPrice,
        stock: parsedStock,
        is_active: true,
        category_id: categoryId || null,
      })
    );

    if (createProduct.fulfilled.match(result)) {
      setName("");
      setPrice("0");
      setStock("0");
      setDescription("");
      setCategoryId("");
    }
  };

  const handleToggleActive = (p: Product) => {
    dispatch(
      updateProduct({
        id: p.id,
        is_active: !p.is_active,
      })
    );
  };

  const handleDelete = (p: Product) => {
    if (!window.confirm(`"${p.name}" adlı ürünü silmek istiyor musun?`)) return;
    dispatch(deleteProduct(p.id));
  };

  // Admin değilse sayfayı kilitle
  if (!currentUser?.is_superuser) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Bu sayfa yalnızca <strong>admin</strong> kullanıcılar tarafından
        görüntülenebilir.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Ürünler</h2>
        <p className="text-sm text-slate-500">
          Mağazada yer alan ürünlerin listesi ve yönetimi.
        </p>
      </div>

      {/* Yeni ürün formu */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Yeni Ürün Ekle
        </h3>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-3 md:grid-cols-5 items-end"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Ürün Adı
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Örn: Macbook Pro"
            />
          </div>
          <div>
            <label
              htmlFor="category-select"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Kategori
            </label>
            <select
              id="category-select"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Kategori seçme</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Fiyat
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>
          <div>
            <label
              htmlFor="stock"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Stok
            </label>
            <input
              id="stock"
              type="number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              placeholder="0"
            />
          </div>
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Açıklama
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Kısa açıklama (opsiyonel)"
            />
          </div>
          <div className="md:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
            >
              {status === "loading" ? "Kaydediliyor..." : "Ürün Oluştur"}
            </button>
          </div>
        </form>
        {error && <p className="mt-2 text-xs text-red-600">Hata: {error}</p>}
      </div>

      {/* Liste */}
      {status === "loading" && products.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Ürünler yükleniyor...
        </div>
      )}

      {status === "failed" && products.length === 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Hata: {error}
        </div>
      )}

      {status === "succeeded" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Açıklama</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
                <th className="px-4 py-3">Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-800">{p.name}</td>
                  <td className="px-4 py-2 text-slate-700">
                    {p.price.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>
                  <td className="px-4 py-2 text-slate-700">{p.stock}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {p.is_active ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-600">
                    {p.description ?? "-"}
                  </td>

                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600"
                    >
                      Sil
                    </button>
                  </td>

                  <td className="px-4 py-2 text-xs text-slate-600">
                    {p.category_id
                      ? categories.find((c) => c.id === p.category_id)?.name ??
                        p.category_id
                      : "-"}
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    Henüz ürün bulunmuyor.
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

export default Products;
