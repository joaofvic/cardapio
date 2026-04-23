'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        // Lança o erro para que o Next.js exiba o overlay de desenvolvimento com o contexto
        console.error(error.message);
        throw error;
      } else {
        toast({
          variant: "destructive",
          title: "Erro de Permissão",
          description: "Você não tem permissão para realizar esta ação.",
        });
      }
    });

    return unsubscribe;
  }, [toast]);

  return null;
}
