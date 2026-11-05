'use client';
import { useState } from 'react';
import { useWorkspace } from '@/features/dashboard/workspace';
import { useRemote } from '@/hooks/use-remote';
import { api } from '@/lib/api';
import type { Job } from '@/types/recruitment';
import { Button } from '@/components/ui/button';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  DataTable,
  StatusBadge,
  Pagination,
} from '@/components/shared/states';
export default function JobsManagement() {
  const { organization } = useWorkspace();
  const [page, setPage] = useState(1);
  const jobs = useRemote<Job[]>(
    organization ? `/organizations/${organization.id}/jobs?page=${page}` : null,
  );
  const [editing, setEditing] = useState<Job | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!organization)
    return (
      <EmptyState message="A recruiter membership is required to manage jobs." />
    );
  async function change(job: Job, remove = false) {
    if (
      remove &&
      !window.confirm(
        `Delete ${job.title}? Jobs with applications cannot be deleted.`,
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      await api(`/jobs/${job.id}`, {
        method: remove ? 'DELETE' : 'PATCH',
        ...(remove ? {} : { body: JSON.stringify({ status: 'ARCHIVED' }) }),
      });
      jobs.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Job update failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        title="Job management"
        description="Create, edit, publish, and archive your organization roles."
      />
      {error && <ErrorState message={error} />}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          {jobs.error ? (
            <ErrorState message={jobs.error} retry={jobs.reload} />
          ) : jobs.loading ? (
            <LoadingState />
          ) : !jobs.data?.length ? (
            <EmptyState message="No jobs on this page. Create a role to start recruiting." />
          ) : (
            <DataTable
              caption="Organization jobs"
              headers={['Job', 'Status', 'Actions']}
            >
              {jobs.data.map((job) => (
                <tr key={job.id}>
                  <td className="p-4">
                    <p className="font-medium">{job.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {job.location}
                    </p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(job)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy || job.status === 'ARCHIVED'}
                        onClick={() => change(job)}
                      >
                        Archive
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => change(job, true)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
          <Pagination
            page={page}
            onChange={setPage}
            count={jobs.data?.length || 0}
          />
        </section>
        <JobForm
          key={`${organization.id}-${editing?.organizationId === organization.id ? editing.id : 'new'}`}
          organizationId={organization.id}
          job={editing?.organizationId === organization.id ? editing : null}
          done={() => {
            setEditing(null);
            jobs.reload();
          }}
          cancel={() => setEditing(null)}
        />
      </div>
    </>
  );
}
function JobForm({
  organizationId,
  job,
  done,
  cancel,
}: {
  organizationId: string;
  job: Job | null;
  done: () => void;
  cancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  return (
    <form
      aria-label={job ? 'Edit job' : 'Create job'}
      className="space-y-4 rounded-xl border bg-white p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        try {
          await api(job ? `/jobs/${job.id}` : '/jobs', {
            method: job ? 'PATCH' : 'POST',
            body: JSON.stringify({ ...data, organizationId }),
          });
          form.reset();
          done();
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Job save failed');
        } finally {
          setSaving(false);
        }
      }}
    >
      <h2 className="text-lg font-semibold">
        {job ? 'Edit job' : 'Create a job'}
      </h2>
      {(['title', 'location', 'requirements'] as const).map((name) => (
        <div key={name}>
          <label htmlFor={name} className="capitalize">
            {name}
          </label>
          <input
            id={name}
            name={name}
            defaultValue={job?.[name]}
            required
            minLength={2}
            maxLength={name === 'requirements' ? 10000 : 160}
          />
        </div>
      ))}
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          required
          minLength={10}
          maxLength={20000}
          defaultValue={job?.description}
        />
      </div>
      <div>
        <label htmlFor="employmentType">Employment type</label>
        <select
          id="employmentType"
          name="employmentType"
          defaultValue={job?.employmentType || 'FULL_TIME'}
        >
          {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="job-status">Status</label>
        <select
          id="job-status"
          name="status"
          defaultValue={job?.status || 'DRAFT'}
        >
          {['DRAFT', 'PUBLISHED', 'ARCHIVED'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      {error && <ErrorState message={error} />}
      <div className="flex gap-2">
        <Button disabled={saving}>
          {saving ? 'Saving...' : job ? 'Save job' : 'Create job'}
        </Button>
        {job && (
          <Button type="button" variant="outline" onClick={cancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
