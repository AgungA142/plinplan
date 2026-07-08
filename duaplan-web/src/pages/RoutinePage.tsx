import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useRoutineToday } from '@/features/routine/hooks/useRoutineToday';
import { useRoutines, useCreateRoutine, useUpdateRoutine, useDeleteRoutine, useToggleComplete } from '@/features/routine/hooks/useRoutines';
import { useStreaks } from '@/features/routine/hooks/useStreaks';
import RoutineList from '@/features/routine/components/RoutineList';
import RoutineDaySummary from '@/features/routine/components/RoutineDaySummary';
import StreakBadge from '@/features/routine/components/StreakBadge';
import RoutineFormModal from '@/features/routine/components/RoutineFormModal';
import type { Routine, RoutineTodayItem } from '@/features/routine/types';

export default function RoutinePage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Routine | undefined>();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data: todayData, isLoading: loadingToday } = useRoutineToday();
  const { data: routines = [] } = useRoutines();
  const { data: streakData } = useStreaks();

  const createMutation  = useCreateRoutine();
  const updateMutation  = useUpdateRoutine();
  const deleteMutation  = useDeleteRoutine();
  const toggleMutation  = useToggleComplete();

  const summary = todayData?.summary ?? { total: 0, completed: 0, all_done: false };
  const allDone = summary.all_done;

  function openCreate() {
    setEditTarget(undefined);
    setFormOpen(true);
  }

  function openEdit(routine: Routine) {
    setEditTarget(routine);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: Record<string, unknown>) {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync(data as Record<string, unknown> & { id: string });
        toast.success('Rutinitas diperbarui');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Rutinitas dibuat');
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan rutinitas');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Rutinitas dihapus');
    } catch {
      toast.error('Gagal menghapus rutinitas');
    }
  }

  async function handleToggle(item: RoutineTodayItem) {
    setPendingId(item.id);
    try {
      await toggleMutation.mutateAsync({ id: item.id, completed: item.completed });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah status');
    } finally {
      setPendingId(null);
    }
  }

  const isFormPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground">Rutinitas</h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {streakData && <StreakBadge streak={streakData.user.current_streak} />}
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="w-4 h-4" /> Rutinitas baru
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-8">
            {/* Progress hari ini */}
            {!loadingToday && summary.total > 0 && (
              <section>
                {allDone && (
                  <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                    <div className="text-2xl mb-1">🎉</div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Semua rutinitas selesai hari ini! Luar biasa!
                    </p>
                  </div>
                )}
                <RoutineDaySummary completed={summary.completed} total={summary.total} />
              </section>
            )}

            {/* Checklist hari ini */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-3">Hari ini</h2>
              {loadingToday ? (
                <p className="text-sm text-muted-foreground">Memuat...</p>
              ) : !todayData || todayData.routines.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="text-sm">Belum ada rutinitas.</p>
                  <p className="text-sm">Buat rutinitas pertamamu!</p>
                </div>
              ) : (
                <RoutineList
                  items={todayData.routines}
                  pendingId={pendingId}
                  onToggle={handleToggle}
                />
              )}
            </section>

            {/* Kelola rutinitas */}
            {routines.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-foreground mb-3">Semua rutinitas</h2>
                <div className="space-y-2">
                  {routines.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                    >
                      {r.icon && <span className="text-lg">{r.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.time_of_day ?? 'Kapan saja'} {r.is_shared ? '· Bersama' : ''}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEdit(r)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(r.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <RoutineFormModal
        open={formOpen}
        routine={editTarget}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isPending={isFormPending}
      />
    </div>
  );
}
