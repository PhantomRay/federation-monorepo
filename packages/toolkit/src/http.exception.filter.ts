import { ExceptionFilter, ArgumentsHost, Catch, HttpException } from '@nestjs/common';

/** for request api */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (![307, 400, 401, 403, 404, 428, 429].includes(exception.status))
      console.error('*** Exception ***\n', exception.message, exception.stack);

    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    // const request = ctx.getRequest();

    const status = exception.status || 500;
    const message = exception.message || 'Internal server error';
    const { response } = exception;

    res.status(status).json(
      response || {
        ack: 'error',
        message
      }
    );
  }
}
