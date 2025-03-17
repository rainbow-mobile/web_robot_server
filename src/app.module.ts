import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/apis/users/users.module';
// import { AuthModule } from '@auth/auth.module';
// import { RobotsModule } from '@robots/robots.module';
import { SocketsModule } from 'src/modules/sockets/sockets.module';
import { TaskModule } from '@task/task.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MoveModule } from './modules/apis/move/move.module';
import { ControlModule } from './modules/apis/control/control.module';
import { MapModule } from './modules/apis/map/map.module';
import { ProcessModule } from './modules/apis/process/process.module';
import { SettingModule } from './modules/apis/setting/setting.module';
import { VariablesModule } from './modules/apis/variables/variables.module';
import { NetworkModule } from './modules/apis/network/network.module';
import { LogModule } from './modules/apis/log/log.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadModule } from './modules/apis/upload/upload.module';
import { SoundModule } from './modules/apis/sound/sound.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'mariadb',
        host: '127.0.0.1',
        port: 3306,
        username: 'rainbow',
        password: 'rainbow',
        database: 'rainbow_rrs',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: false,
        logging: false,
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
    UploadModule,
    SoundModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
