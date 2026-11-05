'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
export function useRemote<T>(path: string | null) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{
    path: string;
    data?: T;
    error?: string;
  }>();
  useEffect(() => {
    if (!path) return;
    let active = true;
    setState({ path });
    api<T>(path).then(
      (data) => {
        if (active) setState({ path, data });
      },
      (error) => {
        if (active)
          setState({
            path,
            error: error instanceof Error ? error.message : 'Request failed',
          });
      },
    );
    return () => {
      active = false;
    };
  }, [path, version]);
  return {
    data: state?.path === path ? state.data : undefined,
    error: state?.path === path ? state.error : undefined,
    loading:
      !!path && (state?.path !== path || (!state?.data && !state?.error)),
    reload: () => setVersion((value) => value + 1),
  };
}
