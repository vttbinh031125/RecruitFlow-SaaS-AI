'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRemote } from '@/hooks/use-remote';
import { api, ApiError } from '@/lib/api';
import type { Job } from '@/types/recruitment';
import { Button } from '@/components/ui/button';
import {
  PageHeader,
  LoadingState,
  ErrorState,
} from '@/components/shared/states';
export function JobDetail({ id }: { id: string }) {
  const job = useRemote<Job>(`/jobs/${encodeURIComponent(id)}`);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loginRequired, setLoginRequired] = useState(false);
  if (job.error) return <ErrorState message={job.error} retry={job.reload} />;
  if (!job.data) return <LoadingState />;
  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/jobs" className="mb-6 inline-block text-sm text-indigo-600">
        All open jobs
      </Link>
      <PageHeader
        title={job.data.title}
        description={`${job.data.organization.name} / ${job.data.location} / ${job.data.employmentType.replaceAll('_', ' ')}`}
      />
      <div className="space-y-7 rounded-xl border bg-white p-8">
        <section>
          <h2 className="mb-3 text-lg font-semibold">About the role</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
            {job.data.description}
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">What you bring</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
            {job.data.requirements}
          </p>
        </section>
        {error && <ErrorState message={error} />}{' '}
        {loginRequired && (
          <Link href="/login" className="block text-indigo-600">
            Sign in to apply
          </Link>
        )}
        {submitted ? (
          <div role="status">
            <p className="font-medium text-green-800">Application submitted</p>
            <Link
              href="/dashboard/applications"
              className="mt-3 inline-block text-indigo-600"
            >
              Track your application
            </Link>
          </div>
        ) : (
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError('');
              setLoginRequired(false);
              try {
                await api(`/jobs/${id}/applications`, {
                  method: 'POST',
                  body: '{}',
                });
                setSubmitted(true);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Application failed');
                setLoginRequired(e instanceof ApiError && e.status === 401);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Submitting...' : 'Apply for this role'}
          </Button>
        )}
        <p className="text-xs text-slate-500">
          Apply with your candidate account. Resume uploads are planned; no
          files are collected in this starter.
        </p>
      </div>
    </article>
  );
}
