import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/apis/users/users.module';
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
import { OnvifDeviceModule } from './modules/apis/onvif/onvif.module';
import { MdnsModule } from './mdns/mdns.module';
import config from './modules/config';

// import { MotionModule } from './modules/apis/motion/motion.module';
import { UpdateModule } from './modules/apis/update/update.module';
import { TestModule } from './modules/apis/test/test.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'mariadb',
        host: process.env.DB_HOST || '127.0.0.1', // mariaDB 컨테이너 이름
        port: 3306,
        username: process.env.DB_USER || 'rainbow',
        password: process.env.DB_PASSWORD || 'rainbow',
        database: process.env.DB_DATABASE || 'rainbow_rrs',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
      }),
    }),
    UsersModule,
    SocketsModule,
    TaskModule,
    ControlModule,
    // SSHModule,
    MoveModule,
    MapModule,
    SettingModule,
    // InfluxDBModule,
    ProcessModule,
    VariablesModule,
    NetworkModule,
    LogModule,
    UploadModule,
    SoundModule,
    UpdateModule,
    // MotionModule,
    ...(!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0'
      ? [OnvifDeviceModule]
      : []),
    TestModule,
    MdnsModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
