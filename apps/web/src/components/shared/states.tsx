import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-slate-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
export function LoadingState() {
  return (
    <p className="rounded-xl border bg-white p-8 text-slate-500" role="status">
      Loading...
    </p>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <p role="alert" className="text-sm text-red-800">
        {message}
      </p>
      {retry && (
        <Button className="mt-3" variant="outline" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-500">
      {message}
    </p>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-800">
      {status.replaceAll('_', ' ')}
    </span>
  );
}
export function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <article className="rounded-xl border bg-white p-6">
      <h2 className="text-sm text-slate-500">{title}</h2>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </article>
  );
}
export function DataTable({
  headers,
  children,
  caption,
}: {
  headers: string[];
  children: ReactNode;
  caption: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b bg-slate-50 text-slate-600">
          <tr>
            {headers.map((label) => (
              <th
                key={label}
                scope="col"
                className="whitespace-nowrap p-4 font-medium"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}
export function Pagination({
  page,
  onChange,
  count,
}: {
  page: number;
  onChange: (page: number) => void;
  count: number;
}) {
  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex items-center justify-end gap-4 text-sm"
    >
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <span>Page {page}</span>
      <Button
        variant="outline"
        disabled={count < 20}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
