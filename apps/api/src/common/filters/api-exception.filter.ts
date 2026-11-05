import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client';
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    let status = 500;
    let message: unknown = 'Internal server error';
    if (error instanceof HttpException) {
      status = error.getStatus();
      message = error.getResponse();
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        status = 409;
        message = 'Record already exists';
      }
      if (error.code === 'P2025') {
        status = 404;
        message = 'Record not found';
      }
      if (error.code === 'P2003') {
        status = 409;
        message = 'Record is referenced or related record is unavailable';
      }
    }
    if (status === 500)
      Logger.error(
        'Unhandled API error',
        error instanceof Error ? error.name : 'UnknownError',
      );
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ statusCode: status, error: message });
  }
}
