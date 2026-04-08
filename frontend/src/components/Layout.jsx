import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Grid3X3, CalendarDays, Sparkles,
  FileText, LogOut, Menu, X, Hotel, ChevronRight, Users, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'receptionist', 'housekeeping'] },
  { to: '/room-board', icon: Grid3X3, label: 'Room Board', roles: ['admin', 'receptionist', 'housekeeping'] },
  { to: '/bookings', icon: CalendarDays, label: 'Bookings', roles: ['admin', 'receptionist'] },
  { to: '/housekeeping', icon: Sparkles, label: 'Housekeeping', roles: ['admin', 'receptionist', 'housekeeping'] },
];

const roleColors = {
  admin: 'text-gold-400 bg-gold-400/10',
  receptionist: 'text-navy-400 bg-navy-400/10',
  housekeeping: 'text-emerald-400 bg-emerald-400/10',
};

export default function Layout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const visibleNav = navItems.filter(item => item.roles.includes(user?.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-navy-500 to-gold-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Hotel size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-display font-semibold text-white text-sm leading-tight">Grand Azure</div>
            <div className="text-xs text-slate-500">Hotel Management</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative
              ${isActive
                ? 'bg-navy-600/20 text-navy-400 border border-navy-600/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-100 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700">
                    {label}
                  </div>
                )}
                {!collapsed && isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-slate-800 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-100 truncate">{user?.name}</div>
              <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block capitalize mt-0.5 ${roleColors[user?.role] || 'text-slate-400 bg-slate-800'}`}>
                {user?.role}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 -right-3 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors z-10"
          style={{ left: collapsed ? '3.5rem' : '13rem' }}
        >
          <ChevronRight size={12} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-slate-900 border-r border-slate-800">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center gap-4 px-4 flex-shrink-0">
          <button
            className="lg:hidden text-slate-400 hover:text-slate-100"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:block">System Online</span>
          </div>
          <div className="text-slate-500 text-xs font-mono hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
