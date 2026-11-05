import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { hash } from 'bcrypt';
config({ path: '../../.env', quiet: true });
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function seed() {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Demo seed is disabled in production');
  const passwordHash = await hash('RecruitFlowDemo123!', 12);
  const org = await db.organization.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: { name: 'Demo Company', slug: 'demo-company' },
  });
  const recruiter = await db.user.upsert({
    where: { email: 'recruiter@recruitflow.test' },
    update: {},
    create: {
      email: 'recruiter@recruitflow.test',
      fullName: 'Demo Recruiter',
      passwordHash,
    },
  });
  const user = await db.user.upsert({
    where: { email: 'candidate@recruitflow.test' },
    update: {},
    create: {
      email: 'candidate@recruitflow.test',
      fullName: 'Demo Candidate',
      passwordHash,
    },
  });
  await db.organizationMember.upsert({
    where: {
      userId_organizationId: { userId: recruiter.id, organizationId: org.id },
    },
    update: {},
    create: { userId: recruiter.id, organizationId: org.id, role: 'OWNER' },
  });
  const candidate = await db.candidate.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
  for (const [index, title] of [
    'Fullstack Developer Intern',
    'Frontend Developer',
    'Backend Developer',
  ].entries()) {
    const job = await db.job.upsert({
      where: { id: `10000000-0000-4000-8000-00000000000${index}` },
      update: {},
      create: {
        id: `10000000-0000-4000-8000-00000000000${index}`,
        organizationId: org.id,
        title,
        description:
          'Build thoughtful recruitment tools with our development team.',
        requirements: 'TypeScript and a willingness to learn',
        location: 'Ho Chi Minh City',
        employmentType: 'INTERNSHIP',
        status: 'PUBLISHED',
      },
    });
    await db.application.upsert({
      where: {
        jobId_candidateId: { jobId: job.id, candidateId: candidate.id },
      },
      update: {},
      create: { jobId: job.id, candidateId: candidate.id },
    });
  }
}
seed()
  .catch(() => {
    console.error('Seed failed; verify database connectivity');
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
