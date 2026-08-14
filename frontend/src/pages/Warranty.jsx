import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import WarrantyFormDialog from '@/components/WarrantyFormDialog';

const statusColors = {
  ACTIVE: 'text-green-400',
  EXPIRED: 'text-white/40',
  CLAIMED: 'text-orange-400',
};

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CLAIMED', label: 'Claimed' },
];

export default function Warranty() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ONLY_VIEW';
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function fetchWarranties() {
    setLoading(true);
    const res = await api.get('/warranties');
    setWarranties(res.data.items);
    setLoading(false);
  }

  useEffect(() => {
    fetchWarranties();
  }, []);

  async function handleStatusChange(id, status) {
    await api.patch('/warranties/' + id + '/status', { status: status });
    fetchWarranties();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this warranty record?')) return;
    await api.delete('/warranties/' + id);
    fetchWarranties();
  }

  function handleSaved() {
    setDialogOpen(false);
    fetchWarranties();
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-semibold">Warranty</h1>
          {!isReadOnly ? (
            <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" /> Add Warranty
            </Button>
          ) : (
            <div className="text-white/50 text-sm">Read-only users cannot add warranty records.</div>
          )}
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/50">Customer</TableHead>
                <TableHead className="text-white/50">Watch</TableHead>
                <TableHead className="text-white/50">Start</TableHead>
                <TableHead className="text-white/50">End</TableHead>
                <TableHead className="text-white/50">Status</TableHead>
                <TableHead className="text-white/50 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-white/40 text-center py-8">Loading...</TableCell></TableRow>
              ) : warranties.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-white/40 text-center py-8">No warranties yet.</TableCell></TableRow>
              ) : (
                warranties.map(function (w) {
                  return (
                    <TableRow key={w.id} className="border-white/10">
                      <TableCell className="text-white">
                        <p className="font-medium">{w.customer.name}</p>
                        <p className="text-white/40 text-xs">{isReadOnly ? 'Hidden' : w.customer.phone}</p>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {w.inventory.brand} {w.inventory.model}
                      </TableCell>
                      <TableCell className="text-white/70 text-sm">
                        {new Date(w.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-white/70 text-sm">
                        {new Date(w.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          items={statusOptions}
                          value={w.status}
                          onValueChange={(v) => !isReadOnly && handleStatusChange(w.id, v)}
                        >
                          <SelectTrigger
                            disabled={isReadOnly}
                            className={'w-32 h-8 bg-black/40 border-white/10 text-xs ' + statusColors[w.status]}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111111] border-white/10 text-white">
                            {statusOptions.map(function (opt) {
                              return <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        {!isReadOnly ? (
                          <button onClick={() => handleDelete(w.id)} className="text-white/50 hover:text-red-400">
                            <Trash2 size={16} className="inline" />
                          </button>
                        ) : (
                          <span className="text-white/40 text-xs">Read-only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <WarrantyFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={handleSaved} />
      </main>
    </div>
  );
}