import { Navigate, Link } from 'react-router-dom';
import { Calendar, CheckSquare, Wallet, PiggyBank } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Kalender Bersama',
    description: 'Sinkronisasi jadwal dan event bersama pasangan secara real-time.',
  },
  {
    icon: CheckSquare,
    title: 'Rutinitas Harian',
    description: 'Bangun kebiasaan bersama dengan checklist harian dan streak tracking.',
  },
  {
    icon: Wallet,
    title: 'Catatan Keuangan',
    description: 'Lacak pengeluaran dan pemasukan bersama secara transparan.',
  },
  {
    icon: PiggyBank,
    title: 'Tujuan Tabungan',
    description: 'Rencanakan dan pantau tujuan finansial bersama dengan kalkulator otomatis.',
  },
];

export default function LandingPage() {
  const { isAuthenticated, couple } = useAuthStore();

  if (isAuthenticated) {
    return (
      <Navigate
        to={couple?.pair_status === 'active' ? '/calendar' : '/pair'}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">duaplan</span>
        <div className="flex items-center gap-3">
          <Link to="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Masuk
          </Link>
          <Link to="/register" className={cn(buttonVariants({ size: 'sm' }))}>
            Mulai Sekarang
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 gap-8">
        <div className="space-y-4 max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Satu aplikasi untuk semua aspek kehidupan bersama
          </h1>
          <p className="text-muted-foreground text-lg">
            Rencanakan jadwal, rutinitas, keuangan, dan tujuan bersama pasangan — tersinkron secara real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/register" className={cn(buttonVariants({ size: 'lg' }))}>
            Mulai Sekarang
          </Link>
          <Link to="/login" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
            Masuk
          </Link>
        </div>

        <div className="w-full max-w-2xl rounded-xl overflow-hidden border border-border">
          <img
            src="https://picsum.photos/seed/duaplan/800/400"
            alt="duaplan preview"
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-10">Semua yang kamu butuhkan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 p-5 rounded-lg border border-border bg-card"
              >
                <div className="shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-16 text-center space-y-4">
        <h2 className="text-2xl font-semibold">Siap memulai?</h2>
        <p className="text-muted-foreground">Daftar gratis dan hubungkan akun dengan pasanganmu.</p>
        <Link to="/register" className={cn(buttonVariants({ size: 'lg' }))}>
          Buat Akun Gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        duaplan &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
