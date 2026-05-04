'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '../client';

export interface UseTableOptions {
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  realtime?: boolean;
  enabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTable<T = any>(
  tableName: string | null,
  options: UseTableOptions = {}
) {
  const { orderBy, limit, realtime = false, enabled = true } = options;
  const orderColumn = orderBy?.column;
  const orderAscending = orderBy?.ascending ?? true;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  if (!supabaseRef.current) supabaseRef.current = createClient();
  const supabase = supabaseRef.current;

  useEffect(() => {
    if (!tableName || !enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchData = async () => {
      let q = supabase.from(tableName).select('*');
      if (orderColumn) q = q.order(orderColumn, { ascending: orderAscending });
      if (limit) q = q.limit(limit);
      const { data: rows, error: err } = await q;
      if (cancelled) return;
      if (err) {
        setError(new Error(err.message));
        setData([]);
      } else {
        setData((rows as T[]) ?? []);
        setError(null);
      }
      setLoading(false);
    };

    fetchData();

    if (!realtime) {
      return () => {
        cancelled = true;
      };
    }

    const channel = supabase
      .channel(`realtime:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase, tableName, orderColumn, orderAscending, limit, realtime, enabled]);

  return { data, loading, error };
}
