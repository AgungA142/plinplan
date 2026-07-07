import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/store/authStore';
import PairCodeDisplay from '@/components/PairCodeDisplay';
import PairCodeInput from '@/components/PairCodeInput';

type Tab = 'share' | 'input';

export default function PairPage() {
  const navigate = useNavigate();
  const { couple, pairWithPartner, generateNewCode } = useAuthStore();
  const [tab, setTab] = useState<Tab>('share');

  useEffect(() => {
    if (couple?.pair_status === 'active') navigate('/calendar', { replace: true });
  }, [couple, navigate]);

  async function handlePair(code: string) {
    try {
      await pairWithPartner(code);
      toast.success('Berhasil terhubung dengan pasangan!');
      navigate('/calendar', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghubungkan akun');
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
  );
}
