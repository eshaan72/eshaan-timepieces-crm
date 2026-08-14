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

const statusOptions = [
  { value: 'RECEIVED', label: 'Received' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_PARTS', label: 'Waiting for Parts' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DELIVERED', label: 'Delivered' },
];

export default function RepairTimelineDialog({ open, onOpenChange, repairId, onUpdated }) {
  const [repair, setRepair] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(function () {
    if (open && repairId) {
      api.get('/repairs/' + repairId).then(function (res) {
        setRepair(res.data);
        setStatus(res.data.status);
        setNote('');
      });
    }
  }, [open, repairId]);

  async function handleUpdate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/repairs/' + repairId + '/status', { status: status, note: note });
      setRepair(function (prev) {
        return Object.assign({}, prev, { status: status, timeline: res.data.timeline });
      });
      setNote('');
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  if (!repair) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#111111] border-white/10 text-white">
          <p className="text-white/40 text-sm">Loading...</p>
        </DialogContent>
      </Dialog>
    );
  }

  const images = repair.images || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{repair.customer.name} - Repair Job</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-white/60 space-y-1">
          {repair.inventory && (
            <p>Watch: {repair.inventory.brand} {repair.inventory.model}</p>
          )}
          {!repair.inventory && repair.externalWatchBrand && (
            <p>Watch: {repair.externalWatchBrand} {repair.externalWatchModel}</p>
          )}
          {repair.technician && (
            <p>Technician: {repair.technician.name}</p>
          )}
          {repair.notes && <p>Notes: {repair.notes}</p>}
        </div>

        {images.length > 0 && (
          <div>
            <Label className="text-white/60 text-xs">Photos ({images.length})</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {images.map(function (url, index) {
                return (
                  <img
                    key={url + index}
                    src={'http://localhost:5000' + url}
                    alt="Repair item"
                    className="rounded-md h-24 w-full object-cover border border-white/10"
                  />
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-3 border-t border-white/10 pt-4">
          <Label className="text-white/60 text-xs">Update Status</Label>
          <div className="flex gap-2">
            <Select items={statusOptions} value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-black/40 border-white/10 text-white flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-white/10 text-white">
                {statusOptions.map(function (opt) {
                  return <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <Input
            value={note}
            onChange={function (e) { setNote(e.target.value); }}
            placeholder="Add a note (optional)"
            className="bg-black/40 border-white/10 text-white"
          />
          <Button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? 'Updating...' : 'Update Status'}
          </Button>
        </form>

        <div className="border-t border-white/10 pt-4">
          <p className="text-white/60 text-xs mb-3">Timeline</p>
          <div className="space-y-3">
            {repair.timeline.map(function (t) {
              return (
                <div key={t.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white">{t.status.replace('_', ' ')}</p>
                    <p className="text-white/50 text-xs">{t.note}</p>
                    <p className="text-white/30 text-xs">{new Date(t.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}