import { Request, Response } from 'express';
import httpLogger from '@common/logger/http.logger';

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: () => void,
): void {
  const startRequestTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startRequestTime;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorization, cookie, ...safeHeaders } = req.headers;
    const headers = JSON.stringify(safeHeaders);
    // const message = `\n요청자 IP : ${req.ip}\n메소드 : ${req.method}\n호출 URL : ${req.url}\n응답코드 : ${res.statusCode}\n응답시간 : ${duration}ms\n헤더 : ${headers}`;
    const message = `${req.method} ${req.url} : 응답(${res.statusCode}), 응답시간(${duration}ms)`;
    
    httpLogger.debug(message);
  });

  next();
}
