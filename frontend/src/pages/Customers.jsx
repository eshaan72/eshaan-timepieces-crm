import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, MessageCircle } from 'lucide-react';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import CustomerFormDialog from '@/components/CustomerFormDialog';

export default function Customers() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ONLY_VIEW';
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  async function fetchItems() {
    setLoading(true);
    const res = await api.get('/customers', { params: { search: search } });
    setItems(res.data.items);
    setLoading(false);
  }

  useEffect(function () {
    const timeout = setTimeout(fetchItems, 300);
    return function () {
      clearTimeout(timeout);
    };
  }, [search]);

  function openAddDialog() {
    setEditingCustomer(null);
    setDialogOpen(true);
  }

  function openEditDialog(customer) {
    setEditingCustomer(customer);
    setDialogOpen(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this customer?')) return;
    await api.delete('/customers/' + id);
    fetchItems();
  }

  function handleSaved() {
    setDialogOpen(false);
    fetchItems();
  }

  function buildWhatsappLink(number) {
    const digitsOnly = number.replace(/[^0-9]/g, '');
    return 'https://wa.me/' + digitsOnly;
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-semibold">Customers</h1>
          {!isReadOnly ? (
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" /> Add Customer
            </Button>
          ) : (
            <div className="text-white/50 text-sm">Read-only users cannot add customers.</div>
          )}
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <Input
            placeholder="Search name, phone, email..."
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            className="pl-9 bg-[#111111] border-white/10 text-white"
          />
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/50">Name</TableHead>
                <TableHead className="text-white/50">Phone</TableHead>
                <TableHead className="text-white/50">Email</TableHead>
                <TableHead className="text-white/50 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-white/40 text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-white/40 text-center py-8">No customers yet.</TableCell>
                </TableRow>
              ) : (
                items.map(function (c) {
                  return (
                    <TableRow key={c.id} className="border-white/10">
                      <TableCell className="text-white font-medium">{c.name}</TableCell>
                      <TableCell className="text-white/70">{c.phone ?? 'Hidden'}</TableCell>
                      <TableCell className="text-white/70">{c.email ? (isReadOnly ? 'Hidden' : c.email) : 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {!isReadOnly && c.whatsapp ? (
                          <a
                            href={buildWhatsappLink(c.whatsapp)}
                            target="whatsapp_tab"
                            rel="noreferrer"
                            className="text-white/50 hover:text-green-400 inline-block"
                          >
                            <MessageCircle size={16} className="inline" />
                          </a>
                        ) : null}
                        {!isReadOnly ? (
                          <>
                            <button onClick={function () { openEditDialog(c); }} className="text-white/50 hover:text-white">
                              <Pencil size={16} className="inline" />
                            </button>
                            <button onClick={function () { handleDelete(c.id); }} className="text-white/50 hover:text-red-400">
                              <Trash2 size={16} className="inline" />
                            </button>
                          </>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <CustomerFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          customer={editingCustomer}
          onSaved={handleSaved}
        />
      </main>
    </div>
  );
}
