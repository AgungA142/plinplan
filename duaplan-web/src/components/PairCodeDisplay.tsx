import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  pairCode: string;
  onRefresh: () => Promise<void>;
}

export default function PairCodeDisplay({ pairCode, onRefresh }: Props) {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(pairCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleRefresh() {
    setRefreshing(true);
    try { await onRefresh(); }
    finally { setRefreshing(false); }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-sm text-muted-foreground">Bagikan kode ini ke pasanganmu</p>
      <div className="bg-muted rounded-xl px-8 py-5">
        <span className="text-4xl font-mono font-bold tracking-[0.3em] text-foreground select-all">
          {pairCode}
        </span>
      </div>
      <div className="flex gap-2">
        <Button onClick={copyCode} variant="secondary" size="sm">
          {copied ? 'Tersalin!' : 'Salin kode'}
        </Button>
        <Button onClick={handleRefresh} variant="ghost" size="sm" disabled={refreshing}>
          {refreshing ? 'Memuat...' : 'Perbarui kode'}
        </Button>
      </div>
    </div>
  );
}
