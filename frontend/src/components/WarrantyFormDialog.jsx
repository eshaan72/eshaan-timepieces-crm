import { useState, useEffect } from 'react';
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

export default function WarrantyFormDialog({ open, onOpenChange, onSaved }) {
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [inventoryId, setInventoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [terms, setTerms] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      api.get('/customers', { params: { limit: 200 } }).then((res) => setCustomers(res.data.items));
      api.get('/inventory', { params: { limit: 200 } }).then((res) => setInventory(res.data.items));
      setCustomerId('');
      setInventoryId('');
      setStartDate('');
      setEndDate('');
      setTerms('');
      setError('');
    }
  }, [open]);

  const customerOptions = customers.map(function (c) {
    return { value: c.id, label: c.name + ' - ' + c.phone };
  });

  const inventoryOptions = inventory.map(function (inv) {
    return { value: inv.id, label: inv.brand + ' ' + inv.model + ' (' + inv.sku + ')' };
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!customerId || !inventoryId || !startDate || !endDate) {
      setError('Please fill in customer, watch, and both dates');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/warranties', {
        customerId: customerId,
        inventoryId: inventoryId,
        startDate: startDate,
        endDate: endDate,
        terms: terms,
      });
      onSaved();
    } catch (err) {
      setError(err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Failed to create warranty');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Warranty</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Customer</Label>
            <Select items={customerOptions} value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="bg-black/40 border-white/10 text-white w-full">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/10 text-white">
                {customerOptions.map(function (opt) {
                  return <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Watch</Label>
            <Select items={inventoryOptions} value={inventoryId} onValueChange={setInventoryId}>
              <SelectTrigger className="bg-black/40 border-white/10 text-white w-full">
                <SelectValue placeholder="Select a watch" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/10 text-white">
                {inventoryOptions.map(function (opt) {
                  return <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-black/40 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Terms (optional)</Label>
            <Input
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="e.g. Covers movement defects only"
              className="bg-black/40 border-white/10 text-white"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-white/60">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Creating...' : 'Add Warranty'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}