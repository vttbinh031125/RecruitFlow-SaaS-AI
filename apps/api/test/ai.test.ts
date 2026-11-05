import { jest } from '@jest/globals';
import 'reflect-metadata';
import { MockAIProvider, AIProvider } from '../src/modules/ai/ai.provider';
import { AIService } from '../src/modules/ai/ai.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { OrganizationsService } from '../src/modules/organizations/organizations.module';
import { ForbiddenException } from '@nestjs/common';
it('labels synthetic output without pretending to read a resume', async () => {
  const result = await new MockAIProvider().analyze();
  expect(result.demonstration).toBe(true);
  expect(result.provider).toBe('mock');
  expect(result.summary).toContain('No resume was read or analyzed');
  expect(result).not.toHaveProperty('decision');
});
it('authorizes before calling a provider or saving analysis', async () => {
  const db = {
    application: {
      findUniqueOrThrow: jest
        .fn<() => Promise<unknown>>()
        .mockResolvedValue({ job: { organizationId: 'other' } }),
    },
    aIAnalysis: { create: jest.fn() },
  };
  const org = {
    requireRecruiter: jest
      .fn<() => Promise<unknown>>()
      .mockRejectedValue(new ForbiddenException()),
  };
  const provider = { analyze: jest.fn() };
  await expect(
    new AIService(
      db as unknown as PrismaService,
      org as unknown as OrganizationsService,
      provider as unknown as AIProvider,
    ).analyze('user', 'application'),
  ).rejects.toBeInstanceOf(ForbiddenException);
  expect(provider.analyze).not.toHaveBeenCalled();
  expect(db.aIAnalysis.create).not.toHaveBeenCalled();
});
