import { useState, useEffect } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export default function OrderFormDialog({ open, onOpenChange, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [repeatInfo, setRepeatInfo] = useState(null);
  const [items, setItems] = useState([{ inventoryId: '', quantity: 1, price: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      api.get('/customers', { params: { limit: 200 } }).then((res) => setCustomers(res.data.items));
      api.get('/inventory', { params: { limit: 200 } }).then((res) => setInventory(res.data.items));
      setCustomerId('');
      setRepeatInfo(null);
      setItems([{ inventoryId: '', quantity: 1, price: '' }]);
      setError('');
    }
  }, [open]);

  const customerOptions = customers.map(function (c) {
    return { value: c.id, label: c.name + ' - ' + c.phone };
  });

  const inventoryOptions = inventory.map(function (inv) {
    return { value: inv.id, label: inv.brand + ' ' + inv.model + ' (Stock: ' + inv.stock + ')' };
  });

  async function handleCustomerChange(id) {
    setCustomerId(id);
    const res = await api.get('/customers/' + id);
    const orders = res.data.orders || [];
    if (orders.length > 0) {
      const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const last = sorted[0];
      setRepeatInfo({
        count: orders.length,
        lastDate: new Date(last.createdAt).toLocaleDateString(),
      });
    } else {
      setRepeatInfo(null);
    }
  }

  function updateItem(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'inventoryId') {
      const inv = inventory.find((i) => i.id === value);
      if (inv) updated[index].price = inv.sellingPrice;
    }
    setItems(updated);
  }

  function addItemRow() {
    setItems([...items, { inventoryId: '', quantity: 1, price: '' }]);
  }

  function removeItemRow(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  const total = items.reduce(function (sum, i) {
    return sum + (Number(i.price) || 0) * (Number(i.quantity) || 0);
  }, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    if (items.some((i) => !i.inventoryId)) {
      setError('Please select an item for each row');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.post('/orders', { customerId: customerId, items: items });
      onSaved();
    } catch (err) {
      setError(err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Failed to create order');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-white/10 text-white max-w-xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Customer</Label>
            <Select items={customerOptions} value={customerId} onValueChange={handleCustomerChange}>
              <SelectTrigger className="bg-black/40 border-white/10 text-white w-full">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/10 text-white">
                {customerOptions.map(function (opt) {
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {repeatInfo && (
            <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/30 rounded-md p-3 text-sm text-blue-300">
              <Info size={16} className="mt-0.5 shrink-0" />
              <p>
                Repeat customer - {repeatInfo.count} previous order(s). Last order on {repeatInfo.lastDate}.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-white/60 text-xs">Items</Label>
            {items.map(function (item, index) {
              return (
                <div key={index} className="flex flex-col gap-2 border border-white/10 rounded-md p-3">
                  <Select
                    items={inventoryOptions}
                    value={item.inventoryId}
                    onValueChange={(v) => updateItem(index, 'inventoryId', v)}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10 text-white w-full">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-white/10 text-white">
                      {inventoryOptions.map(function (opt) {
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Label className="text-white/40 text-xs">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-white/40 text-xs">Price (Rs.)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="text-white/40 hover:text-red-400 mt-4"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addItemRow}
              className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300"
            >
              <Plus size={14} /> Add another item
            </button>
          </div>

          <div className="flex justify-between items-center border-t border-white/10 pt-3">
            <span className="text-white/60 text-sm">Total</span>
            <span className="text-white text-xl font-semibold">
              Rs. {total.toLocaleString('en-IN')}
            </span>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-white/60">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}