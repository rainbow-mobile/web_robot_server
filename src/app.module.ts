import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/apis/users/users.module';
// import { AuthModule } from '@auth/auth.module';
// import { RobotsModule } from '@robots/robots.module';
import { SocketsModule } from 'src/modules/sockets/sockets.module';
import { TaskModule } from '@task/task.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { MoveModule } from './modules/apis/move/move.module';
import { ControlModule } from './modules/apis/control/control.module';
import { MapModule } from './modules/apis/map/map.module';
import { ProcessModule } from './modules/apis/process/process.module';
import { SettingModule } from './modules/apis/setting/setting.module';
import { VariablesModule } from './modules/apis/variables/variables.module';
import { NetworkModule } from './modules/apis/network/network.module';
import { LogModule } from './modules/apis/log/log.module';
import { UploadModule } from './modules/apis/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('MARIADB_HOST'),
        port: configService.get<number>('MARIADB_PORT'),
        username: configService.get<string>('MARIADB_USERNAME'),
        password: configService.get<string>('MARIADB_PASSWORD'),
        database: configService.get<string>('MARIADB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true,
      }),
    }),
    UsersModule,
    SocketsModule,
    TaskModule,
    ControlModule,
    MoveModule,
    MapModule,
    SettingModule,
    ProcessModule,
    VariablesModule,
    NetworkModule,
    LogModule,
    UploadModule
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
