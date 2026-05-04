'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { loginAction } from './actions';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await loginAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          E-mail
        </Label>
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="h-12 rounded-xl bg-muted/30 border-none font-bold focus-visible:ring-primary"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Senha
        </Label>
        <Input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="h-12 rounded-xl bg-muted/30 border-none font-bold focus-visible:ring-primary"
        />
      </div>
      {error && (
        <p className="text-[11px] font-bold text-destructive">{error}</p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="w-full h-12 rounded-full font-black bg-primary hover:bg-primary/90 text-white uppercase tracking-tighter"
      >
        {pending ? <Loader2 className="animate-spin" size={18} /> : 'Entrar'}
      </Button>
    </form>
  );
}
