import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const emptyForm = {
  brand: '', model: '', collection: '', sku: '', serialNumber: '',
  movement: '', caseSize: '', dialColor: '', strap: '',
  sellingPrice: '', costPrice: '', stock: '', supplier: '',
};

export default function InventoryFormDialog({ open, onOpenChange, item, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        brand: item.brand || '', model: item.model || '', collection: item.collection || '',
        sku: item.sku || '', serialNumber: item.serialNumber || '', movement: item.movement || '',
        caseSize: item.caseSize || '', dialColor: item.dialColor || '', strap: item.strap || '',
        sellingPrice: item.sellingPrice || '', costPrice: item.costPrice || '',
        stock: item.stock ?? '', supplier: item.supplier || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [item, open]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (item) {
        await api.patch(`/inventory/${item.id}`, form);
      } else {
        await api.post('/inventory', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    ['brand', 'Brand'], ['model', 'Model'], ['collection', 'Collection'],
    ['sku', 'SKU'], ['serialNumber', 'Serial Number'], ['movement', 'Movement'],
    ['caseSize', 'Case Size'], ['dialColor', 'Dial Color'], ['strap', 'Strap'],
    ['supplier', 'Supplier'],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add Inventory Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-2">
          {fields.map(([name, label]) => (
            <div key={name} className="space-y-1.5">
              <Label className="text-white/60 text-xs">{label}</Label>
              <Input
                name={name}
                value={form[name]}
                onChange={handleChange}
                required={['brand', 'model', 'sku', 'serialNumber'].includes(name)}
                className="bg-black/40 border-white/10 text-white"
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Selling Price (₹)</Label>
            <Input
              name="sellingPrice" type="number" step="0.01"
              value={form.sellingPrice} onChange={handleChange} required
              className="bg-black/40 border-white/10 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Cost Price (₹)</Label>
            <Input
              name="costPrice" type="number" step="0.01"
              value={form.costPrice} onChange={handleChange} required
              className="bg-black/40 border-white/10 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Stock</Label>
            <Input
              name="stock" type="number"
              value={form.stock} onChange={handleChange} required
              className="bg-black/40 border-white/10 text-white"
            />
          </div>

          {error && <p className="text-red-400 text-sm col-span-2">{error}</p>}

          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-white/60">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving...' : item ? 'Update' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}