import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '../hooks/useEvents';
import type { CalendarEvent, EventCategory, RecurRule } from '@/types';

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'date', label: 'Kencan' },
  { value: 'routine', label: 'Rutinitas' },
  { value: 'financial', label: 'Keuangan' },
  { value: 'family', label: 'Keluarga' },
  { value: 'health', label: 'Kesehatan' },
  { value: 'other', label: 'Lainnya' },
];

const COLOR_SWATCHES = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
];

interface Props {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
  event?: CalendarEvent;
  instanceDate?: string;
}

function toInputDate(iso: string) {
  return iso.split('T')[0];
}
function toInputTime(iso: string) {
  return iso.split('T')[1]?.slice(0, 5) ?? '00:00';
}
function toISO(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function EventFormModal({
  open,
  onClose,
  defaultDate,
  event,
  instanceDate,
}: Props) {
  const isEdit = !!event;
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const defaultDateStr = (defaultDate ?? new Date()).toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState<EventCategory | ''>('');
  const [color, setColor] = useState('#6366f1');
  const [description, setDesc] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurFreq, setRecurFreq] = useState<RecurRule['freq']>('weekly');
  const [recurInterval, setRecurInterval] = useState(1);
  const [recurUntil, setUntil] = useState('');
  const [recurScope, setRecurScope] = useState<'this' | 'all'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (event) {
      setShowDeleteConfirm(false);
      setTitle(event.title);
      setDate(toInputDate(event.start_at));
      setStartTime(toInputTime(event.start_at));
      setEndTime(event.end_at ? toInputTime(event.end_at) : '10:00');
      setAllDay(event.all_day);
      setCategory((event.category ?? '') as EventCategory | '');
      setColor(event.color ?? '#6366f1');
      setDesc(event.description ?? '');
      setIsRecurring(event.is_recurring);
      if (event.recur_rule) {
        setRecurFreq(event.recur_rule.freq);
        setRecurInterval(event.recur_rule.interval);
        setUntil(
          event.recur_rule.until ? toInputDate(event.recur_rule.until) : '',
        );
      }
    } else {
      setTitle('');
      setDate(defaultDateStr);
      setStartTime('09:00');
      setEndTime('10:00');
      setAllDay(false);
      setCategory('');
      setColor('#6366f1');
      setDesc('');
      setIsRecurring(false);
      setRecurFreq('weekly');
      setRecurInterval(1);
      setUntil('');
      setRecurScope('all');
      setShowDeleteConfirm(false);
    }
  }, [open, event, defaultDateStr]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title,
      start_at: allDay ? `${date}T00:00:00.000Z` : toISO(date, startTime),
      end_at: allDay ? `${date}T23:59:59.000Z` : toISO(date, endTime),
      all_day: allDay,
      category: (category || undefined) as EventCategory | undefined,
      color,
      description: description || undefined,
      is_recurring: isRecurring,
      recur_rule: isRecurring
        ? {
            freq: recurFreq,
            interval: recurInterval,
            until: recurUntil ? `${recurUntil}T23:59:59.000Z` : undefined,
          }
        : undefined,
    };

    try {
      if (isEdit && event) {
        await updateEvent.mutateAsync({
          id: event.id,
          data: payload,
          scope: event.is_recurring ? recurScope : undefined,
          instanceDate:
            event.is_recurring && recurScope === 'this'
              ? instanceDate
              : undefined,
        });
        toast.success('Event berhasil diperbarui');
      } else {
        await createEvent.mutateAsync(payload);
        toast.success('Event berhasil dibuat');
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan event');
    }
  }

  async function handleDelete(scope: 'this' | 'all') {
    if (!event) return;
    try {
      await deleteEvent.mutateAsync({
        id: event.id,
        scope: event.is_recurring ? scope : undefined,
        instanceDate:
          event.is_recurring && scope === 'this' ? instanceDate : undefined,
      });
      toast.success('Event berhasil dihapus');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus event');
    }
  }

  const isPending =
    createEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Event' : 'Buat Event Baru'}</DialogTitle>
        </DialogHeader>

        {showDeleteConfirm && event?.is_recurring ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Ini adalah event berulang. Apa yang ingin Anda hapus?
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDelete('this')}
                disabled={isPending}
              >
                Hapus hanya ini
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete('all')}
                disabled={isPending}
              >
                Hapus semua
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isPending}
            >
              Batal
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Judul */}
            <div className="space-y-1">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Nama event"
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-1">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Seharian */}
            <div className="flex items-center gap-2">
              <Switch
                id="allday"
                checked={allDay}
                onCheckedChange={setAllDay}
              />
              <Label htmlFor="allday">Seharian</Label>
            </div>

            {/* Waktu */}
            {!allDay && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Mulai</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Selesai</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Kategori */}
            <div className="space-y-1">
              <Label>Kategori</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as EventCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Warna */}
            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{
                      backgroundColor: swatch,
                      borderColor: color === swatch ? 'currentColor' : 'transparent',
                    }}
                    onClick={() => setColor(swatch)}
                    title={swatch}
                  />
                ))}
                <Input
                  className="h-8 w-28 font-mono text-xs"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6366f1"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label>Deskripsi</Label>
              <Textarea
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Opsional"
                rows={2}
              />
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring">Ulangi event</Label>
            </div>

            {isRecurring && (
              <div className="rounded-lg border border-border p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Frekuensi</Label>
                    <Select
                      value={recurFreq}
                      onValueChange={(v) =>
                        setRecurFreq(v as RecurRule['freq'])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Harian</SelectItem>
                        <SelectItem value="weekly">Mingguan</SelectItem>
                        <SelectItem value="monthly">Bulanan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Setiap</Label>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={recurInterval}
                      onChange={(e) =>
                        setRecurInterval(Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Berakhir (opsional)</Label>
                  <Input
                    type="date"
                    value={recurUntil}
                    onChange={(e) => setUntil(e.target.value)}
                  />
                </div>
                {isEdit && event?.is_recurring && (
                  <div className="space-y-1">
                    <Label>Ubah</Label>
                    <Select
                      value={recurScope}
                      onValueChange={(v) =>
                        setRecurScope(v as 'this' | 'all')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this">Event ini saja</SelectItem>
                        <SelectItem value="all">Semua event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <div className="flex gap-2">
                {isEdit && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (event?.is_recurring) {
                        setShowDeleteConfirm(true);
                      } else {
                        handleDelete('all');
                      }
                    }}
                    disabled={isPending}
                  >
                    Hapus
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onClose()}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
