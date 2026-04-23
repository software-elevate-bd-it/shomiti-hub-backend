import {ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus} from '@nestjs/common';
import {Request, Response} from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';
    const responseBody: any = exception instanceof HttpException ? exception.getResponse() : null;

    const errors = Array.isArray(responseBody?.['message'])
      ? responseBody['message'].map((message) => ({field: null, message}))
      : [];

    response.status(status).json({
      success: false,
      statusCode: status,
      message: typeof message === 'string' ? message : ((message as any)?.message ?? 'Error'),
      data: null,
      errors,
    });
  }
}
