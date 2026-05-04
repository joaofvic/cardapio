'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '../client';

export interface UseRowOptions {
  idColumn?: string;
  realtime?: boolean;
  enabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRow<T = any>(
  tableName: string | null,
  id: string | number | null,
  options: UseRowOptions = {}
) {
  const { idColumn = 'id', realtime = false, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  useEffect(() => {
    if (!tableName || id === null || id === undefined || !enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchRow = async () => {
      const { data: row, error: err } = await supabase
        .from(tableName)
        .select('*')
        .eq(idColumn, id)
        .maybeSingle();
      if (cancelled) return;
      if (err) {
        setError(new Error(err.message));
        setData(null);
      } else {
        setData((row as T) ?? null);
        setError(null);
      }
      setLoading(false);
    };

    fetchRow();

    if (!realtime) {
      return () => {
        cancelled = true;
      };
    }

    const channel = supabase
      .channel(`realtime:${tableName}:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `${idColumn}=eq.${id}`,
        },
        () => {
          fetchRow();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase, tableName, id, idColumn, realtime, enabled]);

  return { data, loading, error };
}
