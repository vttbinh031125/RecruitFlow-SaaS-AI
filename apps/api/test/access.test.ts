import { jest } from '@jest/globals';
import 'reflect-metadata';
import { ForbiddenException } from '@nestjs/common';
import { OrganizationsService } from '../src/modules/organizations/organizations.module';
import { JobsService } from '../src/modules/jobs/jobs.service';
import {
  ApplicationsService,
  transitions,
} from '../src/modules/applications/applications.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { environmentSchema } from '../src/config/environment';
it('denies missing organization membership', async () => {
  const db = {
    organizationMember: {
      findUnique: jest.fn<() => Promise<unknown>>().mockResolvedValue(null),
    },
  };
  await expect(
    new OrganizationsService(db as unknown as PrismaService).requireRecruiter(
      'user',
      'other-org',
    ),
  ).rejects.toBeInstanceOf(ForbiddenException);
});
it('does not create jobs when membership is denied', async () => {
  const db = { job: { create: jest.fn() } };
  const organizations = {
    requireRecruiter: jest
      .fn<() => Promise<unknown>>()
      .mockRejectedValue(new ForbiddenException()),
  };
  await expect(
    new JobsService(
      db as unknown as PrismaService,
      organizations as unknown as OrganizationsService,
    ).create('user', { organizationId: 'other' } as never),
  ).rejects.toBeInstanceOf(ForbiddenException);
  expect(db.job.create).not.toHaveBeenCalled();
});
it('scopes candidate application reads to the authenticated identity', async () => {
  const db = {
    application: {
      findMany: jest.fn<() => Promise<unknown>>().mockResolvedValue([]),
    },
  };
  await new ApplicationsService(
    db as unknown as PrismaService,
    {} as OrganizationsService,
  ).mine('candidate-a', { page: 1, limit: 20 });
  expect(db.application.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { candidate: { userId: 'candidate-a' } },
    }),
  );
});
it('rejects unsafe configuration', () => {
  expect(
    environmentSchema.safeParse({
      DATABASE_URL: 'file:test',
      JWT_SECRET: 'short',
    }).success,
  ).toBe(false);
});
it('does not permit automatic skips or reopening final decisions', () => {
  expect(transitions.APPLIED).not.toContain('HIRED');
  expect(transitions.HIRED).toEqual([]);
  expect(transitions.REJECTED).toEqual([]);
});
