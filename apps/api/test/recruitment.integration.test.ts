import 'reflect-metadata';
import { spawn, type ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { hash } from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test'))
  throw new Error(
    'TEST_DATABASE_URL must name a dedicated database ending in _test',
  );
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});
const base = 'http://127.0.0.1:3101/api';
const origin = 'http://localhost:5173';
const password = 'IntegrationTest123!';
const ids = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
const orgs = [randomUUID(), randomUUID()];
let server: ChildProcess;
let recruiterCookie: string;
let candidateCookie: string;
let otherCookie: string;
let otherCandidateCookie: string;
let jobId: string;
let applicationId: string;
async function request(
  path: string,
  method = 'GET',
  cookie = '',
  body?: unknown,
  requestOrigin = origin,
) {
  return fetch(base + path, {
    method,
    headers: {
      Origin: requestOrigin,
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
async function login(index: number) {
  const res = await request('/auth/login', 'POST', '', {
    email: `${ids[index]}@test.invalid`,
    password,
  });
  expect(res.status).toBe(200);
  const cookie = res.headers.get('set-cookie')!;
  expect(cookie).toContain('HttpOnly');
  expect(cookie).toContain('SameSite=Strict');
  return cookie.split(';')[0];
}
beforeAll(async () => {
  const passwordHash = await hash(password, 12);
  for (const [index, id] of ids.entries()) {
    await db.user.create({
      data: {
        id,
        email: `${id}@test.invalid`,
        fullName: 'Synthetic tester',
        passwordHash,
        ...(index > 1 ? { candidate: { create: {} } } : {}),
      },
    });
  }
  for (const [index, id] of orgs.entries()) {
    await db.organization.create({
      data: {
        id,
        name: 'Synthetic organization',
        slug: id,
        members: { create: { userId: ids[index], role: 'RECRUITER' } },
      },
    });
  }
  server = spawn(process.execPath, ['dist/main.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: url,
      API_PORT: '3101',
      WEB_ORIGIN: origin,
    },
    stdio: 'ignore',
  });
  let ready = false;
  for (let attempt = 0; attempt < 400; attempt++) {
    try {
      if ((await request('/health')).ok) {
        ready = true;
        break;
      }
    } catch {
      /* API may still be starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  if (!ready) throw new Error('Test API did not start');
  recruiterCookie = await login(0);
  otherCookie = await login(1);
  candidateCookie = await login(2);
  otherCandidateCookie = await login(3);
});
afterAll(async () => {
  server?.kill();
  await db.application.deleteMany({
    where: { job: { organizationId: { in: orgs } } },
  });
  await db.job.deleteMany({ where: { organizationId: { in: orgs } } });
  await db.organizationMember.deleteMany({
    where: { organizationId: { in: orgs } },
  });
  await db.organization.deleteMany({ where: { id: { in: orgs } } });
  await db.candidate.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
});
it('rejects missing authentication and untrusted origins', async () => {
  expect((await request('/jobs', 'POST', '', {})).status).toBe(401);
  expect(
    (await request('/auth/login', 'POST', '', {}, 'https://evil.invalid'))
      .status,
  ).toBe(403);
});
it('creates a job only for an authorized recruiter', async () => {
  const data = {
    organizationId: orgs[0],
    title: 'Integration Engineer',
    description: 'A synthetic role for integration checks',
    requirements: 'TypeScript',
    location: 'Remote',
    employmentType: 'FULL_TIME',
    status: 'PUBLISHED',
  };
  expect((await request('/jobs', 'POST', otherCookie, data)).status).toBe(403);
  const response = await request('/jobs', 'POST', recruiterCookie, data);
  expect(response.status).toBe(201);
  jobId = (await response.json()).id;
  expect(
    (await request(`/organizations/${orgs[0]}/jobs`, 'GET', otherCookie))
      .status,
  ).toBe(403);
  expect(
    (await request(`/organizations/${orgs[0]}/jobs`, 'GET', recruiterCookie))
      .status,
  ).toBe(200);
});
it('prevents cross-tenant job modifications and exposes no applicant data publicly', async () => {
  expect(
    (
      await request(`/jobs/${jobId}`, 'PATCH', otherCookie, {
        title: 'Hijacked',
      })
    ).status,
  ).toBe(403);
  expect((await request(`/jobs/${jobId}`, 'DELETE', otherCookie)).status).toBe(
    403,
  );
  const data = await (await request(`/jobs/${jobId}`)).json();
  expect(data).not.toHaveProperty('applications');
  expect(data).not.toHaveProperty('passwordHash');
});
it('creates one application and rejects duplicates', async () => {
  const res = await request(
    `/jobs/${jobId}/applications`,
    'POST',
    candidateCookie,
    {},
  );
  expect(res.status).toBe(201);
  applicationId = (await res.json()).id;
  expect(
    (await request(`/jobs/${jobId}/applications`, 'POST', candidateCookie, {}))
      .status,
  ).toBe(409);
});
it('isolates candidates and organization application lists', async () => {
  expect(
    await (
      await request('/applications/me', 'GET', otherCandidateCookie)
    ).json(),
  ).toEqual([]);
  expect(
    (
      await request(
        `/organizations/${orgs[0]}/applications`,
        'GET',
        otherCookie,
      )
    ).status,
  ).toBe(403);
  const own = await (
    await request('/applications/me', 'GET', candidateCookie)
  ).json();
  expect(own).toHaveLength(1);
  expect(JSON.stringify(own)).not.toContain('passwordHash');
});
it('authorizes status transitions and rejects skipped stages', async () => {
  expect(
    (
      await request(
        `/applications/${applicationId}/status`,
        'PATCH',
        otherCookie,
        { status: 'SCREENING' },
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await request(
        `/applications/${applicationId}/status`,
        'PATCH',
        candidateCookie,
        { status: 'SCREENING' },
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await request(
        `/applications/${applicationId}/status`,
        'PATCH',
        recruiterCookie,
        { status: 'HIRED' },
      )
    ).status,
  ).toBe(400);
  expect(
    (
      await request(
        `/applications/${applicationId}/status`,
        'PATCH',
        recruiterCookie,
        { status: 'SCREENING' },
      )
    ).status,
  ).toBe(200);
});
it('validates payloads and pagination', async () => {
  expect((await request('/jobs?limit=1000')).status).toBe(400);
  expect(
    (
      await request(`/jobs/${jobId}`, 'PATCH', recruiterCookie, {
        unknownField: true,
      })
    ).status,
  ).toBe(400);
});
it('logs out by clearing the cookie', async () => {
  const response = await request('/auth/logout', 'POST', candidateCookie);
  expect(response.status).toBe(204);
  expect(response.headers.get('set-cookie')).toContain(
    'Expires=Thu, 01 Jan 1970',
  );
});

it('registers candidate accounts without accepting privilege escalation', async () => {
  const email = `${randomUUID()}@test.invalid`;
  expect(
    (
      await request('/auth/register', 'POST', '', {
        email,
        password,
        fullName: 'Synthetic candidate',
        platformRole: 'ADMIN',
      })
    ).status,
  ).toBe(400);
  const response = await request('/auth/register', 'POST', '', {
    email,
    password,
    fullName: 'Synthetic candidate',
  });
  expect(response.status).toBe(201);
  const user = await response.json();
  ids.push(user.id);
  expect(user.platformRole).toBe('USER');
  expect(user).not.toHaveProperty('passwordHash');
  expect(
    (
      await request('/auth/register', 'POST', '', {
        email,
        password,
        fullName: 'Synthetic candidate',
      })
    ).status,
  ).toBe(409);
  expect(
    (
      await request('/auth/login', 'POST', '', {
        email,
        password: 'IncorrectPassword123!',
      })
    ).status,
  ).toBe(401);
});

it('requires membership for overview and returns real tenant counts', async () => {
  expect(
    (await request(`/organizations/${orgs[0]}/overview`, 'GET', otherCookie))
      .status,
  ).toBe(403);
  const response = await request(
    `/organizations/${orgs[0]}/overview`,
    'GET',
    recruiterCookie,
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
    jobs: 1,
    publishedJobs: 1,
    applications: 1,
  });
});
it('keeps mock AI private, labeled and unable to change hiring stages', async () => {
  for (const cookie of [candidateCookie, otherCookie])
    expect(
      (await request('/ai/resume-analysis', 'POST', cookie, { applicationId }))
        .status,
    ).toBe(403);
  const response = await request(
    '/ai/resume-analysis',
    'POST',
    recruiterCookie,
    { applicationId },
  );
  expect(response.status).toBe(201);
  expect(await response.json()).toMatchObject({
    demonstration: true,
    provider: 'mock',
  });
  expect(
    (await db.application.findUniqueOrThrow({ where: { id: applicationId } }))
      .status,
  ).toBe('SCREENING');
  expect(await db.aIAnalysis.count({ where: { applicationId } })).toBe(1);
});
