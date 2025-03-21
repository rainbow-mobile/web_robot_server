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
import { ScheduleModule } from '@nestjs/schedule';
import { UploadModule } from './modules/apis/upload/upload.module';
import { SoundModule } from './modules/apis/sound/sound.module';
import { SSHModule } from './modules/apis/ssh/ssh.module';
import { InfluxDBModule } from './modules/apis/influx/influx.module';
import { OnvifDeviceModule } from './modules/apis/onvif/onvif.module';
import { OnvifClientModule } from './modules/apis/onvif_client/onvif_client.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
    SSHModule,
    MoveModule,
    MapModule,
    SettingModule,
    InfluxDBModule,
    ProcessModule,
    VariablesModule,
    NetworkModule,
    LogModule,
    UploadModule,
    SoundModule,
    OnvifClientModule,
    OnvifDeviceModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
