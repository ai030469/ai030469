import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Home, Mic, Plus, TableProperties } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'בית' },
    { path: '/voice', icon: Mic, label: 'הקלטה' },
    { path: '/add', icon: Plus, label: 'הוסף' },
    { path: '/weekly', icon: TableProperties, label: 'שבועי' },
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col" dir="rtl">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 shadow-soft sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-300 to-mint-300 flex items-center justify-center">
              <CalendarDays size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg tracking-tight">מתכנן אירועים</span>
          </div>
          <button
            onClick={() => navigate('/weekly')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-xl text-sm font-semibold hover:bg-sky-100 transition-colors"
          >
            <TableProperties size={15} />
            סיכום שבועי
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 page-enter">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-card md:hidden z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                  active ? 'text-sky-500 bg-sky-50' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="h-16 md:hidden" /> {/* bottom nav spacer */}
    </div>
  );
}
