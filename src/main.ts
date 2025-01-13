import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import helmet from 'helmet';
import * as morgan from 'morgan';
import { ValidationPipe } from '@nestjs/common';
import { loggerMiddleware } from '@common/middleware/logger.middleware';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ExceptionFilterMiddleware } from '@common/middleware/exception-filter.middleware';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.enableCors({
    allowedHeaders: 'Content-Type, Accept, Authorization',
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: false,
    origin: '*',
  });


  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(helmet());
  // app.use(morgan('dev'));
  app.use(loggerMiddleware);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalFilters(new ExceptionFilterMiddleware());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('RainbowRobotics RRS API Server')
    .setDescription(
      `<br/>
      <b>Development Specification</b>
      <br/>
      <table>
        <tr>
          <td>Language</td>
          <td><b>TypeScript / NodeJS 22.11.0</b></td>
        </tr>
        <tr>
          <td>Framework</td>
          <td><b>NestJS 10.4.7</b></td>
        </tr>
        <tr>
          <td>Database</td>
          <td><b>MariaDB 11.4</b></td>
        </tr>
      </table>
      <br><br>
      Copyright © <a target="_blank" href="https://www.rainbow-robotics.com/">Rainbow Robotics</a>`,
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };


  app.use('/swagger', (req, res, next) => {
    res.removeHeader('Content-Security-Policy');
    next();
  });
  SwaggerModule.setup('swagger', app, swaggerDocument, swaggerCustomOptions);

  const port = 11334;
  await app.listen(port);
}

bootstrap();
