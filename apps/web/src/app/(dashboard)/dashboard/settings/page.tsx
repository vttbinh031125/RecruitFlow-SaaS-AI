'use client';
import { useWorkspace } from '@/features/dashboard/workspace';
import { PageHeader } from '@/components/shared/states';
export default function Settings() {
  const { user, members, organization } = useWorkspace();
  return (
    <>
      <PageHeader
        title="Workspace settings"
        description="Your account and organization memberships"
      />
      <section className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 font-semibold">Account</h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd>{user.fullName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Organization</dt>
            <dd>{organization?.name || 'Candidate account'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Membership role</dt>
            <dd>
              {members.find((m) => m.organization.id === organization?.id)
                ?.role || 'Candidate'}
            </dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-slate-500">
          Organization editing, invitations, and subscriptions are planned. No
          settings changes are available in this starter.
        </p>
      </section>
    </>
  );
}
