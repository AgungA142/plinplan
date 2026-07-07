import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  onSubmit: (code: string) => Promise<void>;
}

export default function PairCodeInput({ onSubmit }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 8) return;
    setLoading(true);
    try { await onSubmit(code); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="pair_code">Kode pasangan</Label>
        <Input
          id="pair_code"
          placeholder="Contoh: ABCD1234"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
          className="font-mono text-center text-lg tracking-widest bg-input"
          maxLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">Masukkan 8 karakter kode dari pasanganmu</p>
      </div>
      <Button type="submit" disabled={loading || code.length !== 8}>
        {loading ? 'Menghubungkan...' : 'Hubungkan'}
      </Button>
    </form>
  );
}
