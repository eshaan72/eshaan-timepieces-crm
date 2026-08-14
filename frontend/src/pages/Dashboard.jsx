import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Users, Package, Wrench, ShoppingCart, AlertTriangle } from 'lucide-react';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ONLY_VIEW';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => setError('Unable to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Customers', value: stats.totalCustomers ?? 0, icon: Users },
        { label: 'Total Inventory', value: stats.totalInventory ?? 0, icon: Package },
        { label: "Today's Orders", value: stats.todayOrders ?? 0, icon: ShoppingCart },
        { label: 'Pending Repairs', value: stats.pendingRepairs ?? 0, icon: Wrench },
        { label: 'Low Stock Alerts', value: stats.lowStockCount ?? 0, icon: AlertTriangle, alert: (stats.lowStockCount ?? 0) > 0 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-white text-2xl font-semibold mb-6">Dashboard</h1>

        {loading ? (
          <p className="text-white/40">Loading...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {cards.map((c) => (
                <Card key={c.label} className="bg-[#111111] border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/50 text-xs mb-1">{c.label}</p>
                        <p className={`text-2xl font-semibold ${c.alert ? 'text-red-400' : 'text-white'}`}>
                          {c.value}
                        </p>
                      </div>
                      <c.icon className={c.alert ? 'text-red-400' : 'text-blue-500'} size={28} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-[#111111] border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base">Recent Customers</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentCustomers?.length === 0 ? (
                  <p className="text-white/40 text-sm">No customers yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats?.recentCustomers?.map((c) => (
                      <div key={c.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                        <div>
                          <p className="text-white">{c.name}</p>
                          <p className="text-white/40 text-xs">{isReadOnly ? 'Hidden' : c.phone}</p>
                        </div>
                        <p className="text-white/30 text-xs">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}