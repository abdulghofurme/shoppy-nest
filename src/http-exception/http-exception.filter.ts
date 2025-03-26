import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let errorResponse: Record<string, unknown> & { statusCode: number, message: string } = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error'
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma Errors
      switch (exception.code) {
        case 'P2002':
          errorResponse.statusCode = HttpStatus.CONFLICT
          errorResponse.message = `Unique constraint failed`;
          break;
        case 'P2025':
          errorResponse.statusCode = HttpStatus.NOT_FOUND;
          errorResponse.message = 'Record not found';
          break;
        case 'P2003':
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message = 'Foreign key constraint failed';
          break;
        case 'P2014':
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message = 'Invalid cascade delete operation';
          break;
        default:
          errorResponse.message = 'Databse error'
      }
    } else if (exception instanceof HttpException) {
      // Handle NestJS HttpException
      errorResponse.statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object') {
        if ('message' in exceptionResponse) {
          const messages = exceptionResponse['message'];

          let errors: Record<string, string> = {};
          if (Array.isArray(messages)) {
            // Mengonversi pesan menjadi key-value
            messages.forEach((msg: string) => {
              const parts = msg.split(' '); // Pisahkan kata-kata pesan
              const field = parts[0].toLowerCase(); // Ambil kata pertama sebagai field (biasanya nama field)

              // if (!errors[field]) {
                errors[field] = msg;
              // }
              // errors[field].push(msg); // Tambahkan pesan ke array field terkait
            });
          } else if (typeof messages === 'string') {
            errorResponse.message = messages
            errorResponse.error = messages
          }
          errorResponse.errors = errors
        }
        if ('error' in exceptionResponse && typeof exceptionResponse.error === 'string') {
          errorResponse.message = exceptionResponse.error
        }
      } else {
        errorResponse.message = exceptionResponse
      }
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
