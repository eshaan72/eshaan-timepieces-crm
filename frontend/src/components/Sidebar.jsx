import { LayoutDashboard, Users, Package, ShoppingCart, Wrench, ShieldCheck, BarChart3, MessageCircle, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Customers', icon: Users, path: '/customers' },
  { label: 'Inventory', icon: Package, path: '/inventory' },
  { label: 'Orders', icon: ShoppingCart, path: '/orders' },
  { label: 'Repairs', icon: Wrench, path: '/repairs' },
  { label: 'Warranty', icon: ShieldCheck, path: '/warranty' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'WhatsApp', icon: MessageCircle, path: '/whatsapp' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const availableNavItems = navItems.filter((item) => item.path !== '/settings' || user?.role === 'ADMIN');

  return (
    <aside className="w-64 min-h-screen bg-[#111111] border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-white font-semibold text-lg">Eshaan Timepieces</h2>
        <p className="text-white/40 text-xs mt-1">{user?.role}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {availableNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}