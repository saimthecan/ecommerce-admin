import { useEffect, useState, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchUsers,
  createUser,
  updateUser,
  selectUsers,
  selectUsersStatus,
  selectUsersError,
  type User,
} from "../features/users/usersSlice";
import { selectCurrentUser } from "../features/auth/authSlice";

const Users = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const status = useAppSelector(selectUsersStatus);
  const error = useAppSelector(selectUsersError);
  const currentUser = useAppSelector(selectCurrentUser);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "idle" && currentUser?.is_superuser) {
      dispatch(fetchUsers());
    }
  }, [status, dispatch, currentUser]);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const result = await dispatch(
      createUser({
        email,
        full_name: fullName || null,
        password,
      })
    );

    if (createUser.fulfilled.match(result)) {
      setEmail("");
      setFullName("");
      setPassword("");
    }
  };

  const handleToggleActive = (user: User) => {
    dispatch(
      updateUser({
        id: user.id,
        is_active: !user.is_active,
      })
    );
  };

  const handleToggleAdmin = (user: User) => {
    dispatch(
      updateUser({
        id: user.id,
        is_superuser: !user.is_superuser,
      })
    );
  };

  // 🔒 Admin değilse erken return
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
        <h2 className="text-xl font-semibold tracking-tight">Kullanıcılar</h2>
        <p className="text-sm text-slate-500">
          Sistemde kayıtlı tüm kullanıcıların listesi.
        </p>
      </div>

      {/* Yeni kullanıcı formu – sadece admin zaten buraya gelebiliyor */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Yeni Kullanıcı Ekle
        </h3>
        <form
          onSubmit={handleCreateUser}
          className="grid grid-cols-1 gap-3 md:grid-cols-4 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Ad Soyad
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Opsiyonel"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Şifre
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex w-full md:w-auto items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
            >
              {status === "loading" ? "Kaydediliyor..." : "Kullanıcı Oluştur"}
            </button>
          </div>
        </form>
        {error && (
          <p className="mt-2 text-xs text-red-600">Hata: {error}</p>
        )}
      </div>

      {status === "loading" && users.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Kullanıcılar yükleniyor...
        </div>
      )}

      {status === "failed" && users.length === 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          Hata: {error}
        </div>
      )}

      {status === "succeeded" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3 text-center">Aktif</th>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3">Oluşturulma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-800">{u.email}</td>
                  <td className="px-4 py-2 text-slate-700">
                    {u.full_name ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(u)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {u.is_active ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleAdmin(u)}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.is_superuser
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {u.is_superuser ? "Admin" : "Normal"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {new Date(u.created_at).toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    Henüz kullanıcı bulunmuyor.
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

export default Users;