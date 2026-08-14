import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import InventoryFormDialog from '@/components/InventoryFormDialog';

export default function Inventory() {
  const { user } = useAuth();
  const isReadOnly = user?.role === 'ONLY_VIEW';
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  async function fetchItems() {
    setLoading(true);
    const res = await api.get('/inventory', { params: { search } });
    setItems(res.data.items);
    setLoading(false);
  }

  useEffect(() => {
    const timeout = setTimeout(fetchItems, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  function openAddDialog() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function openEditDialog(item) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/inventory/${id}`);
    fetchItems();
  }

  function handleSaved() {
    setDialogOpen(false);
    fetchItems();
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-semibold">Inventory</h1>
          {!isReadOnly ? (
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" /> Add Item
            </Button>
          ) : (
            <div className="text-white/50 text-sm">Read-only users cannot add inventory items.</div>
          )}
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <Input
            placeholder="Search brand, model, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#111111] border-white/10 text-white"
          />
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/50">Brand / Model</TableHead>
                <TableHead className="text-white/50">SKU</TableHead>
                <TableHead className="text-white/50">Stock</TableHead>
                <TableHead className="text-white/50">Selling Price</TableHead>
                <TableHead className="text-white/50 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-white/40 text-center py-8">Loading...</TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-white/40 text-center py-8">No inventory items yet.</TableCell></TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="border-white/10">
                    <TableCell className="text-white">
                      <p className="font-medium">{item.brand} {item.model}</p>
                      <p className="text-white/40 text-xs">{item.collection}</p>
                    </TableCell>
                    <TableCell className="text-white/70">{item.sku}</TableCell>
                    <TableCell>
                      <span className={item.stock <= 5 ? 'text-red-400' : 'text-white/70'}>
                        {isReadOnly ? 'Hidden' : item.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-white/70">{isReadOnly ? 'Hidden' : `₹${Number(item.sellingPrice).toLocaleString('en-IN')}`}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {!isReadOnly ? (
                        <>
                          <button onClick={() => openEditDialog(item)} className="text-white/50 hover:text-white">
                            <Pencil size={16} className="inline" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-white/50 hover:text-red-400">
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
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

        <InventoryFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          item={editingItem}
          onSaved={handleSaved}
        />
      </main>
    </div>
  );
}