// src/pages/Categories.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  selectCategories,
  selectCategoriesStatus,
  selectCategoriesError,
  type Category,
} from "../features/categories/categoriesSlice";

import { selectCurrentUser } from "../features/auth/authSlice";

const Categories = () => {
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectCategories);
  const status = useAppSelector(selectCategoriesStatus);
  const error = useAppSelector(selectCategoriesError);
  const currentUser = useAppSelector(selectCurrentUser);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Sayfa açılınca kategorileri çek
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
    }
  }, [status, dispatch]);

  // Admin değilse sayfayı kilitle
  if (!currentUser?.is_superuser) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Bu sayfa yalnızca <strong>admin</strong> kullanıcılar tarafından
        görüntülenebilir.
      </div>
    );
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const result = await dispatch(
      createCategory({
        name: name.trim(),
        description: description.trim() || null,
      })
    );

    if (createCategory.fulfilled.match(result)) {
      setName("");
      setDescription("");
    }
  };

  const handleEdit = (cat: Category) => {
    const newName = window.prompt("Yeni kategori adı:", cat.name);
    if (newName === null) return;
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    const newDesc = window.prompt(
      "Yeni açıklama (boş bırakabilirsin):",
      cat.description ?? ""
    );
    const trimmedDesc = newDesc?.trim() || null;

    dispatch(
      updateCategory({
        id: cat.id,
        name: trimmedName,
        description: trimmedDesc,
      })
    );
  };

  const handleDelete = (cat: Category) => {
    if (!window.confirm(`"${cat.name}" kategorisini silmek istiyor musun?`)) {
      return;
    }
    dispatch(deleteCategory(cat.id));
  };

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Kategoriler</h2>
        <p className="text-sm text-slate-500">
          Ürünleri gruplamak için kullanılan kategori listesi.
        </p>
      </div>

      {/* Yeni kategori formu */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Yeni Kategori Ekle
        </h3>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-3 md:grid-cols-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Kategori Adı
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Örn: Elektronik"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Açıklama (opsiyonel)
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: Bilgisayar, telefon vb."
            />
          </div>
          <div className="md:col-span-1 flex justify-end">
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
            >
              {status === "loading" ? "Kaydediliyor..." : "Kategori Oluştur"}
            </button>
          </div>
        </form>
        {error && (
          <p className="mt-2 text-xs text-red-600">Hata: {error}</p>
        )}
      </div>

      {/* Liste */}
      {status === "loading" && categories.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Kategoriler yükleniyor...
        </div>
      )}

      {status === "failed" && categories.length === 0 && (
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
                <th className="px-4 py-3">Açıklama</th>
                <th className="px-4 py-3">Oluşturulma</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-800">{c.name}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">
                    {c.description ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(c)}
                      className="px-3 py-1 text-xs rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    Henüz kategori bulunmuyor.
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

export default Categories;
