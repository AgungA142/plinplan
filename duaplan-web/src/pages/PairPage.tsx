import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/authStore';
import PairCodeDisplay from '@/components/PairCodeDisplay';
import PairCodeInput from '@/components/PairCodeInput';

type Tab = 'share' | 'input';

interface Partner {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export default function PairPage() {
  const navigate = useNavigate();
  const { couple, pairWithPartner, generateNewCode } = useAuthStore();
  const [tab, setTab] = useState<Tab>('share');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [pendingCode, setPendingCode] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (couple?.pair_status === 'active') navigate('/calendar', { replace: true });
  }, [couple, navigate]);

  // Dipanggil saat user klik "Hubungkan" — lookup dulu, buka modal
  async function handlePair(code: string) {
    try {
      const data = await api.get<Partner>(`/v1/couples/lookup?code=${code}`);
      setPendingCode(code);
      setPartner(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kode tidak valid atau sudah digunakan');
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    try {
      await pairWithPartner(pendingCode);
      toast.success('Berhasil terhubung dengan pasangan!');
      navigate('/calendar', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghubungkan akun');
      setPartner(null);
    } finally {
      setConfirming(false);
    }
  }

  async function handleRefreshCode() {
    try {
      await generateNewCode();
      toast.success('Kode berhasil diperbarui');
    } catch {
      toast.error('Gagal memperbarui kode');
    }
  }

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">💑</span>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">duaplan</h1>
            </div>
            <p className="text-muted-foreground text-sm">Hubungkan akunmu dengan pasangan</p>
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Pairing akun</CardTitle>
              <CardDescription>Bagikan kode unikmu atau masukkan kode pasanganmu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setTab('share')}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    tab === 'share'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Bagikan kode
                </button>
                <button
                  type="button"
                  onClick={() => setTab('input')}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    tab === 'input'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Masukkan kode
                </button>
              </div>

              {tab === 'share' ? (
                <PairCodeDisplay
                  pairCode={couple?.pair_code ?? '--------'}
                  onRefresh={handleRefreshCode}
                />
              ) : (
                <PairCodeInput onSubmit={handlePair} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal konfirmasi pasangan */}
      <Dialog open={!!partner} onOpenChange={(open) => { if (!open) setPartner(null); }}>
        <DialogContent showCloseButton={!confirming}>
          <DialogHeader>
            <DialogTitle>Konfirmasi pasangan</DialogTitle>
            <DialogDescription>
              Pastikan ini adalah pasanganmu sebelum menghubungkan akun.
            </DialogDescription>
          </DialogHeader>

          {partner && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary flex-shrink-0">
                {partner.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-foreground">{partner.display_name}</p>
                <p className="text-xs text-muted-foreground">Kode: {pendingCode}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPartner(null)}
              disabled={confirming}
            >
              Batal
            </Button>
            <Button onClick={handleConfirm} disabled={confirming}>
              {confirming ? 'Menghubungkan...' : 'Ya, ini pasanganku'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
