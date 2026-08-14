import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, LayoutList, Columns3, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import RepairFormDialog from '@/components/RepairFormDialog';
import RepairTimelineDialog from '@/components/RepairTimelineDialog';

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

const columns = ['RECEIVED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'DELIVERED'];

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  async function fetchRepairs() {
    setLoading(true);
    const res = await api.get('/repairs');
    setRepairs(res.data.items);
    setLoading(false);
  }

  useEffect(function () {
    fetchRepairs();
  }, []);

  function openTimeline(id) {
    setSelectedId(id);
    setTimelineOpen(true);
  }

  function openAddForm() {
    setEditingRepair(null);
    setFormOpen(true);
  }

  function openEditForm(repair, e) {
    e.stopPropagation();
    setEditingRepair(repair);
    setFormOpen(true);
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('Delete this repair job?')) return;
    await api.delete('/repairs/' + id);
    fetchRepairs();
  }

  function handleSaved() {
    setFormOpen(false);
    fetchRepairs();
  }

  function watchLabel(r) {
    return r.inventory ? (r.inventory.brand + ' ' + r.inventory.model) : (r.externalWatchBrand || '-');
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-semibold">Repairs</h1>
          <div className="flex items-center gap-2">
            <div className="flex bg-[#111111] border border-white/10 rounded-md overflow-hidden mr-2">
              <button
                onClick={function () { setView('list'); }}
                className={'px-3 py-2 text-xs flex items-center gap-1.5 ' + (view === 'list' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white')}
              >
                <LayoutList size={14} /> List
              </button>
              <button
                onClick={function () { setView('board'); }}
                className={'px-3 py-2 text-xs flex items-center gap-1.5 ' + (view === 'board' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white')}
              >
                <Columns3 size={14} /> Board
              </button>
            </div>
            <Button
              variant="outline"
              onClick={function () { navigate('/repairs-dashboard'); }}
              className="bg-transparent border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            >
              <BarChart3 size={16} className="mr-2" /> Dashboard
            </Button>
            <Button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" /> New Repair Job
            </Button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/50">Customer</TableHead>
                  <TableHead className="text-white/50">Watch</TableHead>
                  <TableHead className="text-white/50">Technician</TableHead>
                  <TableHead className="text-white/50">Status</TableHead>
                  <TableHead className="text-white/50">Date</TableHead>
                  <TableHead className="text-white/50 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-white/40 text-center py-8">Loading...</TableCell></TableRow>
                ) : repairs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-white/40 text-center py-8">No repair jobs yet.</TableCell></TableRow>
                ) : (
                  repairs.map(function (r) {
                    return (
                      <TableRow
                        key={r.id}
                        className="border-white/10 cursor-pointer hover:bg-white/5"
                        onClick={function () { openTimeline(r.id); }}
                      >
                        <TableCell className="text-white">
                          <p className="font-medium">{r.customer.name}</p>
                          <p className="text-white/40 text-xs">{r.customer.phone}</p>
                        </TableCell>
                        <TableCell className="text-white/70">{watchLabel(r)}</TableCell>
                        <TableCell className="text-white/70">{r.technician ? r.technician.name : '-'}</TableCell>
                        <TableCell className={statusColors[r.status]}>{statusLabels[r.status]}</TableCell>
                        <TableCell className="text-white/40 text-xs">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <button onClick={function (e) { openEditForm(r, e); }} className="text-white/50 hover:text-white">
                            <Pencil size={16} className="inline" />
                          </button>
                          <button onClick={function (e) { handleDelete(r.id, e); }} className="text-white/50 hover:text-red-400">
                            <Trash2 size={16} className="inline" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(function (colStatus) {
              const jobs = repairs.filter(function (r) { return r.status === colStatus; });
              return (
                <div key={colStatus} className="flex-shrink-0 w-72">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className={'text-xs font-semibold uppercase tracking-wide ' + statusColors[colStatus]}>
                      {statusLabels[colStatus]}
                    </span>
                    <span className="text-white/30 text-xs">{jobs.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[60px]">
                    {jobs.length === 0 ? (
                      <div className="border border-dashed border-white/10 rounded-lg p-4 text-center text-white/20 text-xs">
                        Empty
                      </div>
                    ) : (
                      jobs.map(function (r) {
                        return (
                          <div
                            key={r.id}
                            onClick={function () { openTimeline(r.id); }}
                            className="bg-[#111111] border border-white/10 rounded-lg p-3 cursor-pointer hover:border-white/25 transition-colors"
                          >
                            <p className="text-white text-sm font-medium">{r.customer.name}</p>
                            <p className="text-white/40 text-xs mt-0.5">{watchLabel(r)}</p>
                            {r.technician && (
                              <p className="text-white/30 text-xs mt-1.5">Tech: {r.technician.name}</p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-white/30 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                              <button onClick={function (e) { openEditForm(r, e); }} className="text-white/40 hover:text-white">
                                <Pencil size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <RepairFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          repair={editingRepair}
          onSaved={handleSaved}
        />
        <RepairTimelineDialog
          open={timelineOpen}
          onOpenChange={setTimelineOpen}
          repairId={selectedId}
          onUpdated={fetchRepairs}
        />
      </main>
    </div>
  );
}