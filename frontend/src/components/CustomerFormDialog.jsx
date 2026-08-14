import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const emptyForm = { name: '', phone: '', whatsapp: '', email: '', address: '', notes: '' };

export default function CustomerFormDialog({ open, onOpenChange, customer, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || '', phone: customer.phone || '',
        whatsapp: customer.whatsapp || '', email: customer.email || '',
        address: customer.address || '', notes: customer.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [customer, open]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (customer) {
        await api.patch(`/customers/${customer.id}`, form);
      } else {
        await api.post('/customers', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} required className="bg-black/40 border-white/10 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Phone</Label>
              <Input name="phone" value={form.phone} onChange={handleChange} required className="bg-black/40 border-white/10 text-white" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">WhatsApp</Label>
              <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="bg-black/40 border-white/10 text-white" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Email</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} className="bg-black/40 border-white/10 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Address</Label>
            <Input name="address" value={form.address} onChange={handleChange} className="bg-black/40 border-white/10 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Notes</Label>
            <Input name="notes" value={form.notes} onChange={handleChange} className="bg-black/40 border-white/10 text-white" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-white/60">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving...' : customer ? 'Update' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}