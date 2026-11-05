import { checkHealth } from './health';

afterEach(() => {
  jest.restoreAllMocks();
});

it('accepts the API health contract', async () => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(
      Response.json({ status: 'ok', service: 'recruitflow-api' }),
    );
  await expect(checkHealth()).resolves.toEqual({
    status: 'ok',
    service: 'recruitflow-api',
  });
});

it('rejects an HTTP failure', async () => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(null, { status: 503 }));
  await expect(checkHealth()).rejects.toThrow('unavailable');
});

it('rejects an unrelated or malformed service response', async () => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(Response.json({ status: 'ok' }));
  await expect(checkHealth()).rejects.toThrow('unexpected');
});

it('propagates connection failures', async () => {
  jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(checkHealth()).rejects.toThrow('Failed to fetch');
});
