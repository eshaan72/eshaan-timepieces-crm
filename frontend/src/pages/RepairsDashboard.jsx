import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Users, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusColors = {
  RECEIVED: 'text-yellow-400',
  IN_PROGRESS: 'text-blue-400',
  WAITING_PARTS: 'text-orange-400',
  COMPLETED: 'text-green-400',
  DELIVERED: 'text-white/50',
};

const statusLabels = {
  RECEIVED: 'Received',
  IN_PROGRESS: 'In Progress',
  WAITING_PARTS: 'Waiting Parts',
  COMPLETED: 'Completed',
  DELIVERED: 'Delivered',
};

export default function RepairsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(function () {
    api.get('/repairs/stats').then(function (res) {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  const maxTechCount = data && data.technicianWorkload.length > 0
    ? Math.max.apply(null, data.technicianWorkload.map(function (t) { return t.count; }))
    : 1;

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={function () { navigate('/repairs'); }} className="text-white/50 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-white text-2xl font-semibold">Repairs Dashboard</h1>
        </div>

        {loading || !data ? (
          <p className="text-white/40">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="bg-[#111111] border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/50 text-xs mb-1">Total Repair Jobs</p>
                      <p className="text-2xl font-semibold text-white">{data.totalJobs}</p>
                    </div>
                    <ClipboardList className="text-blue-500" size={28} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#111111] border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/50 text-xs mb-1">Avg Turnaround</p>
                      <p className="text-2xl font-semibold text-white">{data.avgTurnaroundDays} days</p>
                    </div>
                    <Clock className="text-blue-500" size={28} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#111111] border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/50 text-xs mb-1">Active Technicians</p>
                      <p className="text-2xl font-semibold text-white">{data.technicianWorkload.length}</p>
                    </div>
                    <Users className="text-blue-500" size={28} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#111111] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-base">Jobs by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {data.statusCounts.map(function (s) {
                      return (
                        <div key={s.status} className="border border-white/10 rounded-lg p-4 text-center">
                          <p className="text-2xl font-semibold text-white">{s.count}</p>
                          <p className={'text-xs mt-1 ' + statusColors[s.status]}>{statusLabels[s.status]}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111111] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-base">Technician Workload</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.technicianWorkload.length === 0 ? (
                    <p className="text-white/40 text-sm">No jobs assigned to technicians yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.technicianWorkload.map(function (t) {
                        const widthPct = (t.count / maxTechCount) * 100;
                        return (
                          <div key={t.technicianId}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-white">{t.name}</span>
                              <span className="text-white/50">{t.count} job{t.count !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: widthPct + '%' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}