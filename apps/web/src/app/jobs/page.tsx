'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRemote } from '@/hooks/use-remote';
import type { Job } from '@/types/recruitment';
import {
  PageHeader,
  LoadingState,
  ErrorState,
  EmptyState,
  Pagination,
} from '@/components/shared/states';
export default function Jobs() {
  const [page, setPage] = useState(1);
  const jobs = useRemote<Job[]>(`/jobs?page=${page}`);
  return (
    <section>
      <PageHeader
        title="Open opportunities"
        description="Find your next role with teams building something meaningful."
      />
      {jobs.error ? (
        <ErrorState message={jobs.error} retry={jobs.reload} />
      ) : jobs.loading ? (
        <LoadingState />
      ) : !jobs.data?.length ? (
        <EmptyState message="No published jobs on this page." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {jobs.data.map((job) => (
            <article className="rounded-xl border bg-white p-6" key={job.id}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {job.organization.name}
              </p>
              <h2 className="text-xl font-semibold">
                <Link
                  href={`/jobs/${job.id}`}
                  className="hover:text-indigo-600"
                >
                  {job.title}
                </Link>
              </h2>
              <p className="my-3 text-sm text-slate-500">
                {job.location} / {job.employmentType.replaceAll('_', ' ')}
              </p>
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                {job.description}
              </p>
              <Link
                className="mt-5 inline-block text-sm font-medium text-indigo-600"
                href={`/jobs/${job.id}`}
              >
                View role
              </Link>
            </article>
          ))}
        </div>
      )}
      <Pagination
        page={page}
        onChange={setPage}
        count={jobs.data?.length || 0}
      />
    </section>
  );
}
