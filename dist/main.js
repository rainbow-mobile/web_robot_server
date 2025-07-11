"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const common_1 = require("@nestjs/common");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const exception_filter_middleware_1 = require("./common/middleware/exception-filter.middleware");
const bodyParser = require("body-parser");
const xmlParser = require("express-xml-bodyparser");
const express = require("express");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableShutdownHooks();
    app.setGlobalPrefix('api');
    app.enableCors({
        allowedHeaders: 'Content-Type, Accept, Authorization',
        methods: ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: false,
        origin: '*',
    });
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(xmlParser());
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.use((0, helmet_1.default)());
    app.use(logger_middleware_1.loggerMiddleware);
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.useGlobalFilters(new exception_filter_middleware_1.ExceptionFilterMiddleware());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('RainbowRobotics RRS API Server')
        .setDescription(`<br/>
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
      Copyright © <a target="_blank" href="https://www.rainbow-robotics.com/">Rainbow Robotics</a>`)
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const swaggerDocument = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerCustomOptions = {
        swaggerOptions: {
            persistAuthorization: true,
        },
    };
    app.use('/docs/socket', (req, res, next) => {
        res.removeHeader('Content-Security-Policy');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });
    app.use('/docs/socket', express.static((0, path_1.join)(__dirname, '..', 'docs')));
    app.use('/docs/api', (req, res, next) => {
        res.removeHeader('Content-Security-Policy');
        next();
    });
    swagger_1.SwaggerModule.setup('docs/api', app, swaggerDocument, swaggerCustomOptions);
    app.enableShutdownHooks();
    const port = 11334;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map