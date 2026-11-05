'use client';
import { useState } from 'react';
import { useWorkspace } from '@/features/dashboard/workspace';
import { useRemote } from '@/hooks/use-remote';
import { api } from '@/lib/api';
import type { Analysis, Application } from '@/types/recruitment';
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
export default function Applications() {
  const { organization } = useWorkspace();
  const [page, setPage] = useState(1);
  const items = useRemote<Application[]>(
    organization
      ? `/organizations/${organization.id}/applications?page=${page}`
      : `/applications/me?page=${page}`,
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState<{
    organizationId: string;
    applicationId: string;
    result: Analysis;
  } | null>(null);
  async function analyze(id: string) {
    setBusy(true);
    setError('');
    setAnalysis(null);
    try {
      const result = await api<Analysis>('/ai/resume-analysis', {
        method: 'POST',
        body: JSON.stringify({ applicationId: id }),
      });
      setAnalysis({
        organizationId: organization!.id,
        applicationId: id,
        result,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Demo analysis failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        title={organization ? 'Applications' : 'My applications'}
        description={
          organization
            ? 'Review candidates and record human hiring decisions.'
            : 'Your private applications and current stages.'
        }
      />
      {error && <ErrorState message={error} />}{' '}
      {items.error ? (
        <ErrorState message={items.error} retry={items.reload} />
      ) : items.loading ? (
        <LoadingState />
      ) : !items.data?.length ? (
        <EmptyState message="No applications on this page." />
      ) : (
        <DataTable
          caption="Recruitment applications"
          headers={[
            'Candidate / job',
            'Stage',
            organization ? 'Review' : 'Applied',
          ]}
        >
          {items.data.map((item) => (
            <tr key={item.id}>
              <td className="p-4">
                <p className="font-medium">{item.job.title}</p>
                <p className="mt-1 text-slate-500">
                  {item.candidate.user.fullName}
                </p>
                {organization && (
                  <p className="text-xs text-slate-500">
                    {item.candidate.user.email}
                  </p>
                )}
              </td>
              <td className="p-4">
                <StatusBadge status={item.status} />
              </td>
              <td className="p-4">
                {organization ? (
                  <div className="space-y-3">
                    <StageForm
                      key={`${item.id}-${item.status}`}
                      item={item}
                      done={items.reload}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => analyze(item.id)}
                    >
                      Generate demo analysis
                    </Button>
                  </div>
                ) : (
                  new Date(item.appliedAt).toLocaleDateString('en-GB')
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      )}
      <Pagination
        page={page}
        onChange={setPage}
        count={items.data?.length || 0}
      />
      {organization && (
        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          AI demo only: no resume is uploaded, read, or sent externally. Output
          is synthetic and never changes an application stage.
        </p>
      )}
      {analysis && analysis.organizationId === organization?.id && (
        <section
          aria-label="Demo AI analysis"
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6"
        >
          <h2 className="font-semibold">Demonstration analysis</h2>
          <p className="mt-3 text-sm">{analysis.result.summary}</p>
          <p className="mt-3 text-sm">
            Example matched skills: {analysis.result.matchedSkills.join(', ')}
          </p>
          <p className="mt-2 text-sm">
            Example review gaps: {analysis.result.missingSkills.join(', ')}
          </p>
        </section>
      )}
    </>
  );
}
function StageForm({ item, done }: { item: Application; done: () => void }) {
  const [status, setStatus] = useState(item.allowedNextStatuses[0] || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!item.allowedNextStatuses.length)
    return <p className="text-xs text-slate-500">Final decision recorded</p>;
  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
          await api(`/applications/${item.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
          });
          done();
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Stage update failed');
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor={`stage-${item.id}`} className="sr-only">
        Next stage for {item.candidate.user.fullName} - {item.job.title}
      </label>
      <div className="flex items-center gap-2">
        <select
          id={`stage-${item.id}`}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {item.allowedNextStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <Button size="sm" disabled={busy}>
          Update stage
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
