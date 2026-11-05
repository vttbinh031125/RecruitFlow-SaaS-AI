'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { User, Membership } from '@/types/recruitment';
import { LoadingState, ErrorState } from '@/components/shared/states';
import { AppSidebar, AppHeader } from '@/components/layout/app-navigation';
type Workspace = {
  user: User;
  members: Membership[];
  organization: Membership['organization'] | null;
};
const Context = createContext<Workspace | null>(null);
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error('Workspace provider required');
  return context;
}
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [data, setData] = useState<{ user: User; members: Membership[] }>();
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([
      api<User>('/auth/me'),
      api<Membership[]>('/organizations'),
    ]).then(
      ([user, members]) => {
        if (active) {
          setData({ user, members });
          setSelected(members[0]?.organization.id || '');
        }
      },
      (e) => {
        if (!active) return;
        if (e instanceof ApiError && e.status === 401) router.replace('/login');
        else setError(e instanceof Error ? e.message : 'Workspace unavailable');
      },
    );
    return () => {
      active = false;
    };
  }, [router]);
  if (error)
    return (
      <ErrorState message={error} retry={() => window.location.reload()} />
    );
  if (!data) return <LoadingState />;
  const organization =
    data.members.find((member) => member.organization.id === selected)
      ?.organization || null;
  return (
    <Context.Provider value={{ ...data, organization }}>
      <div className="grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)]">
        <AppSidebar recruiter={!!organization} />
        <div className="min-w-0">
          <AppHeader
            user={data.user}
            members={data.members}
            selected={selected}
            onSelect={setSelected}
          />
          <div key={selected || 'candidate'}>{children}</div>
        </div>
      </div>
    </Context.Provider>
  );
}
