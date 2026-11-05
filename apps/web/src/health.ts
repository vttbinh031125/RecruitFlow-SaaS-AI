import type { HealthResponse } from '@recruitflow/shared';

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health', {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('The API is unavailable.');
  const data: unknown = await response.json();
  if (
    typeof data !== 'object' ||
    data === null ||
    !('status' in data) ||
    data.status !== 'ok' ||
    !('service' in data) ||
    data.service !== 'recruitflow-api'
  ) {
    throw new Error('The API returned an unexpected response.');
  }
  return { status: data.status, service: data.service };
}
