import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, Package, Wrench, IndianRupee } from 'lucide-react';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusLabels = {
  RECEIVED: 'Received',
  IN_PROGRESS: 'In Progress',
  WAITING_PARTS: 'Waiting Parts',
  COMPLETED: 'Completed',
  DELIVERED: 'Delivered',
};

export default function Analytics() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ONLY_VIEW';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics').then(function (res) {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#09090B] flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <p className="text-white/40">Loading...</p>
        </main>
      </div>
    );
  }

  const maxRevenue = Math.max.apply(null, data.monthlyRevenue.map(function (m) { return m.amount; }).concat([1]));
  const maxTopSelling = Math.max.apply(null, data.topSelling.map(function (t) { return t.qty; }).concat([1]));

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-white text-2xl font-semibold mb-6">Analytics</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#111111] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs mb-1">Total Revenue</p>
                  <p className="text-2xl font-semibold text-white">
                    {isReadOnly ? '****' : `Rs. ${data.totalRevenue.toLocaleString('en-IN')}`}
                  </p>
                </div>
                <IndianRupee className="text-blue-500" size={28} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs mb-1">This Month</p>
                  <p className="text-2xl font-semibold text-white">
                    {isReadOnly ? '****' : `Rs. ${data.monthRevenue.toLocaleString('en-IN')}`}
                  </p>
                </div>
                <TrendingUp className="text-blue-500" size={28} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs mb-1">Inventory Value (Cost)</p>
                  <p className="text-2xl font-semibold text-white">
                    {isReadOnly ? '****' : `Rs. ${data.inventoryValue.costValue.toLocaleString('en-IN')}`}
                  </p>
                </div>
                <Package className="text-blue-500" size={28} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs mb-1">Inventory Value (Selling)</p>
                  <p className="text-2xl font-semibold text-white">
                    {isReadOnly ? '****' : `Rs. ${data.inventoryValue.sellingValue.toLocaleString('en-IN')}`}
                  </p>
                </div>
                <Wrench className="text-blue-500" size={28} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#111111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">Revenue - Last 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48">
                {data.monthlyRevenue.map(function (m) {
                  const heightPct = maxRevenue > 0 ? (m.amount / maxRevenue) * 100 : 0;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end h-40">
                        <div
                          className="w-full bg-blue-600 rounded-t-md"
                          style={{ height: heightPct + '%' }}
                        />
                      </div>
                      <p className="text-white/40 text-xs">{m.month}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">Top Selling Watches</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topSelling.length === 0 ? (
                <p className="text-white/40 text-sm">No sales data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topSelling.map(function (t) {
                    const widthPct = maxTopSelling > 0 ? (t.qty / maxTopSelling) * 100 : 0;
                    return (
                      <div key={t.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{t.name}</span>
                          <span className="text-white/50">{isReadOnly ? '****' : `${t.qty} sold`}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: widthPct + '%' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#111111] border-white/10 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white text-base">Repairs by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {data.repairsByStatus.length === 0 ? (
                <p className="text-white/40 text-sm">No repair jobs yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {data.repairsByStatus.map(function (r) {
                    return (
                      <div key={r.status} className="text-center border border-white/10 rounded-lg p-4">
                        <p className="text-2xl font-semibold text-white">{isReadOnly ? '****' : r.count}</p>
                        <p className="text-white/50 text-xs mt-1">{statusLabels[r.status] || r.status}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}