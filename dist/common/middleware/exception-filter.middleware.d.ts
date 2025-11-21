import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class ExceptionFilterMiddleware implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): any;
}
