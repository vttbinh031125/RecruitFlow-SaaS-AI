'use client';
import Link from 'next/link';
import { useWorkspace } from '@/features/dashboard/workspace';
import { useRemote } from '@/hooks/use-remote';
import type { Application } from '@/types/recruitment';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  StatCard,
  DataTable,
  StatusBadge,
} from '@/components/shared/states';
type Overview = {
  jobs: number;
  publishedJobs: number;
  applications: number;
  stages: { status: string; count: number }[];
};
export default function Dashboard() {
  const { organization } = useWorkspace();
  const overview = useRemote<Overview>(
    organization ? `/organizations/${organization.id}/overview` : null,
  );
  const recent = useRemote<Application[]>(
    organization
      ? `/organizations/${organization.id}/applications?limit=5`
      : '/applications/me?limit=5',
  );
  return (
    <>
      <PageHeader
        title={
          organization ? 'Recruitment overview' : 'Your application journey'
        }
        description={
          organization
            ? `Live recruitment data for ${organization.name}`
            : 'Track your latest applications and hiring stages.'
        }
      />
      {overview.error && (
        <ErrorState message={overview.error} retry={overview.reload} />
      )}{' '}
      {overview.loading && <LoadingState />}
      {overview.data && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard title="Total jobs" value={overview.data.jobs} />
            <StatCard
              title="Published jobs"
              value={overview.data.publishedJobs}
            />
            <StatCard title="Applications" value={overview.data.applications} />
          </div>
          <section className="mb-8 rounded-xl border bg-white p-6">
            <h2 className="mb-4 font-semibold">Recruitment funnel</h2>
            <div className="flex flex-wrap gap-5">
              {[
                'APPLIED',
                'SCREENING',
                'INTERVIEW',
                'OFFER',
                'HIRED',
                'REJECTED',
              ].map((status) => (
                <div key={status}>
                  <StatusBadge status={status} />
                  <p className="mt-2 text-xl font-semibold">
                    {overview.data!.stages.find((s) => s.status === status)
                      ?.count || 0}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
      <h2 className="mb-4 text-lg font-semibold">Recent applications</h2>
      {recent.error ? (
        <ErrorState message={recent.error} retry={recent.reload} />
      ) : recent.loading ? (
        <LoadingState />
      ) : !recent.data?.length ? (
        <EmptyState message="No applications yet. Browse open jobs or publish a role to get started." />
      ) : (
        <DataTable
          caption="Five most recent applications"
          headers={['Job', 'Candidate', 'Stage']}
        >
          {recent.data.map((item) => (
            <tr key={item.id}>
              <td className="p-4">{item.job.title}</td>
              <td className="p-4">{item.candidate.user.fullName}</td>
              <td className="p-4">
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}
      <Link
        href="/dashboard/applications"
        className="mt-5 inline-block text-sm font-medium text-indigo-600"
      >
        View all applications
      </Link>
    </>
  );
}
