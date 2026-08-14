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
import OrderFormDialog from '@/components/OrderFormDialog';

const statusColors = {
  PENDING: 'text-yellow-400',
  CONFIRMED: 'text-blue-400',
  DELIVERED: 'text-green-400',
  CANCELLED: 'text-red-400',
};

export default function Orders() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ONLY_VIEW';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    const res = await api.get('/orders');
    setOrders(res.data.items);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function handleStatusChange(id, status) {
    await api.patch(`/orders/${id}/status`, { status });
    fetchOrders();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this order? Stock will not be restored automatically.')) return;
    await api.delete(`/orders/${id}`);
    fetchOrders();
  }

  function handleSaved() {
    setDialogOpen(false);
    fetchOrders();
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-semibold">Orders</h1>
          {!isReadOnly ? (
            <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" /> New Order
            </Button>
          ) : (
            <div className="text-white/50 text-sm">Read-only users cannot create orders.</div>
          )}
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/50">Customer</TableHead>
                <TableHead className="text-white/50">Items</TableHead>
                <TableHead className="text-white/50">Total</TableHead>
                <TableHead className="text-white/50">Status</TableHead>
                <TableHead className="text-white/50">Date</TableHead>
                <TableHead className="text-white/50 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-white/40 text-center py-8">Loading...</TableCell></TableRow>
              ) : orders.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-white/40 text-center py-8">No orders yet.</TableCell></TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id} className="border-white/10">
                    <TableCell className="text-white">
                      <p className="font-medium">{o.customer.name}</p>
                      <p className="text-white/40 text-xs">{isReadOnly ? 'Hidden' : o.customer.phone}</p>
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">
                      {o.items.map((i) => `${i.inventory.brand} ${i.inventory.model}`).join(', ')}
                    </TableCell>
                    <TableCell className="text-white/70">{isReadOnly ? 'Hidden' : `₹${Number(o.totalAmount).toLocaleString('en-IN')}`}</TableCell>
                    <TableCell>
                      <Select value={o.status} onValueChange={(v) => !isReadOnly && handleStatusChange(o.id, v)}>
                        <SelectTrigger
                          disabled={isReadOnly}
                          className={`w-36 h-8 bg-black/40 border-white/10 text-xs ${statusColors[o.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111111] border-white/10 text-white">
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-white/40 text-xs">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isReadOnly ? (
                      <button onClick={() => handleDelete(o.id)} className="text-white/50 hover:text-red-400">
                        <Trash2 size={16} className="inline" />
                      </button>
                    ) : (
                      <span className="text-white/40 text-xs">Read-only</span>
                    )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <OrderFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={handleSaved} />
      </main>
    </div>
  );
}