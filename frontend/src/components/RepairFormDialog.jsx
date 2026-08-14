import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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

export default function RepairFormDialog({ open, onOpenChange, repair, onSaved }) {
  const isEditMode = !!repair;

  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [watchSource, setWatchSource] = useState('own');
  const [inventoryId, setInventoryId] = useState('');
  const [externalBrand, setExternalBrand] = useState('');
  const [externalModel, setExternalModel] = useState('');
  const [externalSerial, setExternalSerial] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(function () {
    if (open) {
      api.get('/customers', { params: { limit: 200 } }).then(function (res) { setCustomers(res.data.items); });
      api.get('/inventory', { params: { limit: 200 } }).then(function (res) { setInventory(res.data.items); });
      api.get('/users').then(function (res) { setTechnicians(res.data.items); });
      setError('');

      if (repair) {
        setCustomerId(repair.customerId || '');
        setWatchSource(repair.inventoryId ? 'inventory' : 'own');
        setInventoryId(repair.inventoryId || '');
        setExternalBrand(repair.externalWatchBrand || '');
        setExternalModel(repair.externalWatchModel || '');
        setExternalSerial(repair.externalWatchSerial || '');
        setTechnicianId(repair.technicianId || '');
        setNotes(repair.notes || '');
        setImages(repair.images || []);
      } else {
        setCustomerId('');
        setWatchSource('own');
        setInventoryId('');
        setExternalBrand('');
        setExternalModel('');
        setExternalSerial('');
        setTechnicianId('');
        setNotes('');
        setImages([]);
      }
    }
  }, [open, repair]);

  const customerOptions = customers.map(function (c) {
    return { value: c.id, label: c.name + ' - ' + c.phone };
  });
  const inventoryOptions = inventory.map(function (inv) {
    return { value: inv.id, label: inv.brand + ' ' + inv.model + ' (' + inv.sku + ')' };
  });
  const technicianOptions = technicians.map(function (t) {
    return { value: t.id, label: t.name + ' (' + t.role + ')' };
  });
  const sourceOptions = [
    { value: 'own', label: "Customer's own watch (not purchased from us)" },
    { value: 'inventory', label: 'Purchased from us (from inventory)' },
  ];

  async function handleImagesChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach(function (f) { formData.append('images', f); });
      const res = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages(function (prev) { return prev.concat(res.data.urls); });
    } catch (err) {
      setError('Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeImage(index) {
    setImages(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isEditMode) {
      if (!customerId) { setError('Please select a customer'); return; }
      if (watchSource === 'inventory' && !inventoryId) { setError('Please select which watch from inventory'); return; }
      if (watchSource === 'own' && !externalBrand) { setError('Please enter at least the watch brand'); return; }
    }

    setSaving(true);
    setError('');
    try {
      if (isEditMode) {
        await api.patch('/repairs/' + repair.id, {
          technicianId: technicianId || null,
          notes: notes,
          images: images,
          externalWatchBrand: watchSource === 'own' ? externalBrand : repair.externalWatchBrand,
          externalWatchModel: watchSource === 'own' ? externalModel : repair.externalWatchModel,
          externalWatchSerial: watchSource === 'own' ? externalSerial : repair.externalWatchSerial,
        });
      } else {
        await api.post('/repairs', {
          customerId: customerId,
          inventoryId: watchSource === 'inventory' ? inventoryId : null,
          externalWatchBrand: watchSource === 'own' ? externalBrand : null,
          externalWatchModel: watchSource === 'own' ? externalModel : null,
          externalWatchSerial: watchSource === 'own' ? externalSerial : null,
          technicianId: technicianId || null,
          notes: notes,
          images: images,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.response && err.response.data && err.response.data.error ? err.response.data.error : 'Failed to save repair job');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Repair Job' : 'New Repair Job'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {!isEditMode && (
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
          )}

          {!isEditMode && (
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Watch Source</Label>
              <Select items={sourceOptions} value={watchSource} onValueChange={setWatchSource}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-white/10 text-white">
                  {sourceOptions.map(function (opt) {
                    return <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {!isEditMode && watchSource === 'inventory' && (
            <div className="space-y-1.5">
              <Label className="text-white/60 text-xs">Select Watch</Label>
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
          )}

          {watchSource === 'own' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Brand</Label>
                <Input value={externalBrand} onChange={function (e) { setExternalBrand(e.target.value); }} className="bg-black/40 border-white/10 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Model</Label>
                <Input value={externalModel} onChange={function (e) { setExternalModel(e.target.value); }} className="bg-black/40 border-white/10 text-white" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-white/60 text-xs">Serial Number (if known)</Label>
                <Input value={externalSerial} onChange={function (e) { setExternalSerial(e.target.value); }} className="bg-black/40 border-white/10 text-white" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Technician (optional)</Label>
            <Select items={technicianOptions} value={technicianId} onValueChange={setTechnicianId}>
              <SelectTrigger className="bg-black/40 border-white/10 text-white w-full">
                <SelectValue placeholder="Assign a technician" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/10 text-white">
                {technicianOptions.map(function (opt) {
                  return <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Notes</Label>
            <Input value={notes} onChange={function (e) { setNotes(e.target.value); }} placeholder="Issue description..." className="bg-black/40 border-white/10 text-white" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Photos (optional, multiple allowed)</Label>
            <Input type="file" accept="image/*" multiple onChange={handleImagesChange} className="bg-black/40 border-white/10 text-white file:text-white" />
            {uploading && <p className="text-white/40 text-xs">Uploading...</p>}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map(function (url, index) {
                  return (
                    <div key={url + index} className="relative group">
                      <img
                        src={'http://localhost:5000' + url}
                        alt="Repair item"
                        className="rounded-md h-24 w-full object-cover border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={function () { removeImage(index); }}
                        className="absolute top-1 right-1 bg-black/70 rounded-full p-1 text-white/80 hover:text-red-400 hover:bg-black/90"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={function () { onOpenChange(false); }} className="text-white/60">Cancel</Button>
            <Button type="submit" disabled={saving || uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving...' : isEditMode ? 'Update Job' : 'Create Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}