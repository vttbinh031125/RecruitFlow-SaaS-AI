import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { env } from './config/environment';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(helmet(), cookieParser());
  app.use(
    '/api',
    rateLimit({
      windowMs: 60000,
      limit: 120,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );
  app.use(
    '/api/auth',
    rateLimit({ windowMs: 60000, limit: 15, legacyHeaders: false }),
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers.origin !== env.WEB_ORIGIN
    ) {
      res
        .status(403)
        .json({ statusCode: 403, error: 'Trusted Origin header required' });
      return;
    }
    next();
  });
  app.enableCors({ origin: env.WEB_ORIGIN, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('RecruitFlow API')
        .setVersion('0.1.0')
        .addCookieAuth('access_token')
        .build(),
    ),
  );
  app.enableShutdownHooks();
  await app.listen(env.API_PORT, '127.0.0.1');
}
void bootstrap().catch(() => {
  Logger.error(
    'API startup failed; check environment and database connectivity',
  );
  process.exitCode = 1;
});
