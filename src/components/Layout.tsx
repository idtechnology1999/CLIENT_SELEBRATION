import { Link, Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, Users, DollarSign, Wallet, Settings, LogOut, Menu, X, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationApi } from '../services/api';
import ChatWidget from './ChatWidget';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; read: boolean }>>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await notificationApi.list();
      if (res.success && res.data) {
        setNotifications(res.data as any);
      }
    } catch {}
    setNotifLoading(false);
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/dashboard/referrals', icon: Users, label: 'Referrals' },
    { to: '/dashboard/earnings', icon: DollarSign, label: 'Earnings' },
    { to: '/dashboard/withdraw', icon: Wallet, label: 'Withdraw' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm fixed left-0 right-0 z-50 top-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/">
              <img src={logo} alt="Selebration" className="h-8 w-auto object-contain" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => { setShowNotif(!showNotif); if (!showNotif) fetchNotifications(); }}
                className="relative p-2"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full" style={{ background: '#EF4444' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  {notifLoading ? (
                    <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">No notifications</div>
                  ) : (
                    <div>
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-gray-50 ${n.read ? '' : 'bg-amber-50/50'}`}>
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <aside className={`fixed top-14 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full">
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      <main className="lg:ml-64 pt-14 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}
