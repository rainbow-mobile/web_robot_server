import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import httpLogger from '@common/logger/http.logger';

@Catch()
export class ExceptionFilterMiddleware implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message = exception.message;
    // exception instanceof HttpException
    //   ? exception.message
    //   : HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500;

    console.error(exception);
    httpLogger.warn(`[FILTER] Exception Filter: ${JSON.stringify(exception)}`);
    response.status(status).json({
      status,
      message,
    });
  }
}
