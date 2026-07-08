import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Routine } from '../types';

interface RoutineFormModalProps {
  open: boolean;
  routine?: Routine;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  isPending?: boolean;
}

const DEFAULT_FORM = {
  title: '',
  icon: '',
  time_of_day: 'anytime' as const,
  is_shared: false,
};

export default function RoutineFormModal({
  open,
  routine,
  onClose,
  onSubmit,
  isPending,
}: RoutineFormModalProps) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (routine) {
      setForm({
        title:       routine.title,
        icon:        routine.icon ?? '',
        time_of_day: (routine.time_of_day as typeof DEFAULT_FORM['time_of_day']) ?? 'anytime',
        is_shared:   routine.is_shared ?? false,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [routine, open]);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    onSubmit({
      ...(routine ? { id: routine.id } : {}),
      title:       form.title.trim(),
      icon:        form.icon.trim() || undefined,
      time_of_day: form.time_of_day,
      is_shared:   form.is_shared,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{routine ? 'Edit rutinitas' : 'Rutinitas baru'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="routine-title">Nama rutinitas</Label>
            <Input
              id="routine-title"
              placeholder="Olahraga pagi..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="routine-icon">Ikon (emoji)</Label>
            <Input
              id="routine-icon"
              placeholder="🏃"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              maxLength={10}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Waktu</Label>
            <Select
              value={form.time_of_day}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, time_of_day: v as typeof form.time_of_day }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Pagi</SelectItem>
                <SelectItem value="afternoon">Siang</SelectItem>
                <SelectItem value="evening">Malam</SelectItem>
                <SelectItem value="anytime">Kapan saja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="routine-shared">Rutinitas bersama</Label>
            <Switch
              id="routine-shared"
              checked={form.is_shared}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_shared: v }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !form.title.trim()}>
              {isPending ? 'Menyimpan...' : routine ? 'Simpan' : 'Buat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
