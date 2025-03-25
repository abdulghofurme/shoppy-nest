import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma Errors
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT
          message = `Unique constraint failed on ${exception.meta?.target}`;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;
        case 'P2014':
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid cascade delete operation';
          break;
        default:
          message = 'Databse error'
      }
    } else if (exception instanceof HttpException) {
      // Handle NestJS HttpException
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse()
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else {
        message = JSON.stringify(exception.getResponse())
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
