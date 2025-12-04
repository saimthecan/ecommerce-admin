import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  clearAuth,
  selectCurrentUser,
} from "../features/auth/authSlice";

const DashboardLayout = () => {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate("/login", { replace: true });
  };

const navItems = [
    { path: "/overview", label: "Overview" },
    { path: "/users", label: "Users" },
    { path: "/products", label: "Products" },
    { path: "/categories", label: "Categories" }, 
    { path: "/orders", label: "Orders (gelecek)" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-950 border-r border-slate-700/60 px-3 py-4 flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700" />
          <span className="font-semibold text-sm tracking-wide">
            Ecommerce Admin
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={[
                  "px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-emerald-500/20 border border-emerald-500/70 text-slate-50"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="h-16 border-b border-slate-700/60 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur">
          <div className="flex flex-col">
            <h1 className="text-base font-semibold">Dashboard</h1>
            <p className="text-xs text-slate-400">
              Admin panel overview
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-xs font-semibold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs">{user.email}</span>
                  {user.is_superuser && (
                    <span className="text-[10px] text-emerald-400">
                      Super Admin
                    </span>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="rounded-full border border-red-500/70 bg-red-900/30 px-3 py-1 text-xs text-red-100 hover:bg-red-600 hover:text-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;