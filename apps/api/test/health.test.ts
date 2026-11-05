import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
let app: INestApplication;
beforeAll(async () => {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({})
    .compile();
  app = module.createNestApplication();
  app.setGlobalPrefix('api');
  await app.listen(0, '127.0.0.1');
});
afterAll(async () => {
  await app?.close();
});
it('serves the prefixed health contract', async () => {
  const response = await fetch(`${await app.getUrl()}/api/health`);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    status: 'ok',
    service: 'recruitflow-api',
  });
});
it('requires authentication for private applications', async () => {
  expect(
    (await fetch(`${await app.getUrl()}/api/applications/me`)).status,
  ).toBe(401);
});
