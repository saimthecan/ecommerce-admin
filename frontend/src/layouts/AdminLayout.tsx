// src/layouts/AdminLayout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearAuth, selectCurrentUser } from "../features/auth/authSlice";
import { clearOrdersState } from "../features/orders/ordersSlice";

const AdminLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(clearOrdersState());
    dispatch(clearAuth());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-50 flex flex-col">
        <div className="px-4 py-4 text-lg font-semibold border-b border-slate-800">
          Ecommerce Admin
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
          <NavLink
            to="/overview"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${isActive
                ? "bg-slate-800 text-white"
                : "text-slate-200 hover:bg-slate-800/60"
              }`
            }
          >
            Overview
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${isActive
                ? "bg-slate-800 text-white"
                : "text-slate-200 hover:bg-slate-800/60"
              }`
            }
          >
            Kullanıcılar
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${isActive
                ? "bg-slate-800 text-white"
                : "text-slate-200 hover:bg-slate-800/60"
              }`
            }
          >
            Ürünler
          </NavLink>


          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${isActive
                ? "bg-slate-800 text-white"
                : "text-slate-200 hover:bg-slate-800/60"
              }`
            }
          >
            Kategoriler
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${isActive
                ? "bg-slate-800 text-white"
                : "text-slate-200 hover:bg-slate-800/60"
              }`
            }
          >
            Siparişler
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${isActive
                ? "bg-slate-800 text-white"
                : "text-slate-200 hover:bg-slate-800/60"
              }`
            }
          >
            Envanter
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${isActive
                ? "bg-slate-800 text-white"
                : "text-slate-200 hover:bg-slate-800/60"
              }`
            }
          >
            Raporlar
          </NavLink>
        </nav>


        <div className="border-t border-slate-800 px-4 py-3 text-xs text-slate-300">
          {user && (
            <div className="mb-2">
              <div className="font-medium">{user.full_name ?? user.email}</div>
              <div className="text-slate-400">
                {user.is_superuser ? "Admin" : "Kullanıcı"}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-slate-700 py-1.5 text-xs font-medium hover:bg-slate-600"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1">
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center text-sm text-slate-700">
          Dashboard
        </header>

        <section className="p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
