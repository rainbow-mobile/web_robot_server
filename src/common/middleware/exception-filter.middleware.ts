import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { HttpStatusMessagesConstants } from '@common/constants/http-status-messages.constants';

@Catch()
export class ExceptionFilterMiddleware implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500;

    response.status(status).json({
      status,
      message,
    });
  }
}
