import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { LogService } from './modules/apis/log/log.service';
import { generateGeneralLog } from '@common/logger/equipment.logger';
import { GeneralLogType, GeneralOperationName, GeneralOperationStatus, GeneralScope, GeneralStatus } from '@common/enum/equipment.enum';

@Injectable()
export class AppService implements OnApplicationShutdown {
  constructor(private readonly logService:LogService){
    console.log("AppService On")
  }
  onApplicationShutdown(signal?: string) {
    console.error(`Application 종료됨 : ${signal}`);  
    generateGeneralLog({
      logType: GeneralLogType.MANUAL,
      status: GeneralStatus.STOP,
      scope: GeneralScope.EVENT,
      operationName: GeneralOperationName.PROGRAM_END,
      operationStatus: GeneralOperationStatus.SET
    });
  } 
}
