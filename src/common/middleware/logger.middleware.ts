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

    const message = `[${req.method}] ${req.url}: 응답(${res.statusCode}), 응답시간(${duration}ms), 요청자(${req.ip})`;

    if (!req.url.includes('/sockets/status')) {
      httpLogger.debug(message);
    }
  });

  next();
}
