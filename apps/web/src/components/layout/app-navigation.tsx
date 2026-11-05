'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import type { Membership, User } from '@/types/recruitment';
export function AppSidebar({ recruiter }: { recruiter: boolean }) {
  const pathname = usePathname();
  const links = [
    ['/dashboard', 'Overview', LayoutDashboard],
    ...(recruiter
      ? [['/dashboard/jobs', 'Jobs', BriefcaseBusiness] as const]
      : []),
    [
      '/dashboard/applications',
      recruiter ? 'Applications' : 'My applications',
      Users,
    ],
    ['/dashboard/settings', 'Settings', Settings],
  ] as const;
  return (
    <aside>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Workspace
      </p>
      <nav
        aria-label="Workspace navigation"
        className="flex flex-wrap gap-2 lg:flex-col"
      >
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${pathname === href ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
export function AppHeader({
  user,
  members,
  selected,
  onSelect,
}: {
  user: User;
  members: Membership[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const [error, setError] = useState('');
  return (
    <header className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
      <div>
        <p className="font-medium">{user.fullName}</p>
        <p className="text-sm text-slate-500">{user.email}</p>
      </div>
      {members.length > 0 && (
        <div className="w-full sm:w-64">
          <label htmlFor="workspace-organization">Organization</label>
          <select
            id="workspace-organization"
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
          >
            {members.map((member) => (
              <option
                key={member.organization.id}
                value={member.organization.id}
              >
                {member.organization.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <Button
        variant="outline"
        onClick={async () => {
          try {
            await api('/auth/logout', { method: 'POST' });
            window.location.assign('/login');
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Logout failed');
          }
        }}
      >
        Log out
      </Button>
      {error && <p role="alert">{error}</p>}
    </header>
  );
}
