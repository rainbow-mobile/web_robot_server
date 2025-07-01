import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import httpLogger from '@common/logger/http.logger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { StatusPayload } from '@common/interface/robot/status.interface';
import { DataSource } from 'typeorm';
import { StatusLogEntity } from './entity/status.entity';
import * as Query from '@common/interface/db/query';
import { TaskPayload } from '@common/interface/robot/task.interface';
import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import * as os from 'os';
import * as AdmZip from 'adm-zip';
import { DateUtil } from '@common/util/date.util';
import { LogReadDto } from './dto/log.read.dto';
import { PaginationResponse } from '@common/pagination/pagination.response';
import { errorToJson } from '@common/util/error.util';
import * as si from 'systeminformation';
import {
  NetworkUsagePayload,
  ProcessUsagePayload,
  SystemUsagePayload,
} from '@common/interface/system/usage.interface';
import { execSync } from 'child_process';
import { SystemLogEntity } from './entity/system.entity';
import { AlarmEntity } from './entity/alarm.entity';
import { AlarmLogEntity } from './entity/alarmlog.entity';
import { RpcException } from '@nestjs/microservices';
import { AlarmDto } from '@sockets/dto/alarm.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(StatusLogEntity)
    private readonly statusRepository: Repository<StatusLogEntity>,

    @InjectRepository(SystemLogEntity)
    private readonly systemRepository: Repository<SystemLogEntity>,

    @InjectRepository(AlarmLogEntity)
    private readonly alarmLogRepository: Repository<AlarmLogEntity>,
    
    @InjectRepository(AlarmEntity)
    private readonly alarmRepository: Repository<AlarmEntity>,

    private readonly dataSource: DataSource,
  ) {
    console.log('log constructor');
    this.init();

    setInterval(() => {
      this.readMemoryUsage();
    }, 500);
  }

  async init() {
    await this.checkTables('variables', Query.create_variables);
    this.checkTables('status', Query.create_status);
    this.checkTables('move', Query.create_move);
    this.checkTables('system', Query.create_system);
    this.checkTables('alarm', Query.create_alarm);
    this.checkTables('alarmLog', Query.create_alarmLog);
    this.generateAlarmDB();
  }

  private systemUsage = null;
  private processUsage: Map<string, any>;
  private networkUsage = null;
  private alarmIndex:number = 0;

  async addDisconForGaps(filteredArray: { time: Date; value: any }[]) {
    const result = [];
    for (let i = 0; i < filteredArray.length; i++) {
      result.push({
        time: filteredArray[i].time,
        value: filteredArray[i].value,
      });

      if (i < filteredArray.length) {
        const currentEndTime = filteredArray[i].time.getTime();
        const nextStartTime =
          i == filteredArray.length - 1
            ? new Date().getTime()
            : new Date(filteredArray[i + 1].time).getTime();
        const gap = (nextStartTime - currentEndTime) / 1000; // 간격을 분 단위로 계산

        if (gap > 20) {
          // 20초 이상 공백이 있을 때
          if (typeof filteredArray[i].value == 'string') {
            const disconEntry = {
              time: new Date(currentEndTime + 10),
              value: 'Discon',
            };
            result.push(disconEntry);
          } else if (typeof filteredArray[i].value == 'boolean') {
            const disconEntry = {
              time: new Date(currentEndTime + 10),
              value: false,
            };
            result.push(disconEntry);
          } else {
            const disconEntry = {
              time: new Date(currentEndTime + 10),
              value: 0,
            };
            result.push(disconEntry);
          }
        }
      }
    }

    if (result.length > 0) {
      if (typeof result[0].value == 'string') {
        const finalEntry = {
          time: new Date(),
          value: 'Final',
        };
        result.push(finalEntry);
      } else if (typeof result[0].value == 'boolean') {
        const finalEntry = {
          time: new Date(),
          value: false,
        };
        result.push(finalEntry);
      } else {
        const finalEntry = {
          time: new Date(),
          value: 0,
        };
        result.push(finalEntry);
      }
    }
    return result.map((data) => ({
      time: DateUtil.formatDateYYYYMMbDDsHHcMIcSSZZZ(data.time),
      value: data.value,
    }));
  }

  async getStatusParam(key: string) {
    return new Promise(async (resolve, reject) => {
      try {
        httpLogger.debug(`[LOG] getStatusParam : ${key}`);
        const today = new Date();
        const midnightUTC = new Date(
          Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );

        const data = await this.statusRepository
          .createQueryBuilder()
          .where('time >= :midnightUTC', {
            midnightUTC: midnightUTC,
          })
          .getMany();

        let newDataMap;
        if (key.split('/').length > 1) {
          newDataMap = data.map((data) => ({
            time: data.time,
            value: data[key.split('/')[0]][key.split('/')[1]],
          }));
        } else {
          newDataMap = data.map((data) => ({
            time: data.time,
            value: data[key],
          }));
        }
        const finalArray = await this.addDisconForGaps(newDataMap);

        const filteredChanges = finalArray.filter((item, index, arr) => {
          if (index === 0) return true; // 첫 번째 항목은 항상 포함
          return item.value !== arr[index - 1].value;
        });

        resolve(filteredChanges);
      } catch (error) {
        httpLogger.error(`[LOG] getStateState Error : ${errorToJson(error)}`);
        reject({
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
          },
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    });
  }

  async getStatusLog(key: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.statusRepository.find();

        const calculateGapTime = (prev, next) => {
          const gap = (next - prev) / 1000; // 간격을 초 단위로 계산
          return gap;
        };
        const addDisconForGaps = (
          filteredArray: { time: Date; value: any }[],
        ) => {
          const result = [];
          for (let i = 0; i < filteredArray.length; i++) {
            result.push({
              time: moment(filteredArray[i].time),
              value: filteredArray[i].value,
            });
            if (i < filteredArray.length - 1) {
              const currentEndTime = moment(filteredArray[i].time).valueOf();
              const nextStartTime = moment(filteredArray[i + 1].time).valueOf();
              const gap = (nextStartTime - currentEndTime) / 1000; // 간격을 분 단위로 계산

              if (gap > 20) {
                // 20초 이상 공백이 있을 때
                const disconEntry = {
                  time: moment(currentEndTime / 1000 + 10),
                  value: 0,
                };
                result.push(disconEntry);
                const disconEntry2 = {
                  time: moment(nextStartTime / 1000 - 10),
                  value: 0,
                };
                result.push(disconEntry2);
              }
            }
          }

          const curTime = moment();
          if (result.length > 0) {
            if (
              calculateGapTime(result[result.length - 1].time, curTime) > 20
            ) {
              const finalEntry = {
                time: moment.unix(result[result.length - 1].time.unix() + 10),
                value: 0,
              };
              result.push(finalEntry);
              const curEntry = {
                time: curTime,
                value: 0,
              };
              result.push(curEntry);
            }
          } else {
            const finalEntry = {
              time: moment.unix(curTime.unix() - 60 * 12),
              value: 0,
            };
            result.push(finalEntry);
            const curEntry = {
              time: curTime,
              value: 0,
            };
            result.push(curEntry);
          }

          if (result.length > 0) {
            const finalEntry = {
              time: moment.unix(result[result.length - 1].time.unix() + 10),
              value: 0,
            };
            result.push(finalEntry);
          }

          return result.map((data) => ({
            time: data.time.format('YYYY-MM-DD hh:mm:ss'),
            value: data.value,
          }));
        };

        const newDataMap = data.map((data) => ({
          time: data.time,
          value: data[key],
        }));
        const finalArray = addDisconForGaps(newDataMap);
        resolve(finalArray);
      } catch (error) {
        httpLogger.error(`[LOG] getStatusLog Error : ${errorToJson(error)}`);
        reject({
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
          },
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    });
  }

  async readLogLines(filePath: string): Promise<string[]> {
    const lines: string[] = [];
    const fileStream = fs.createReadStream(filePath, 'utf-8');
    const rl = readline.createInterface({ input: fileStream });

    for await (const line of rl) {
      if (line.trim()) {
        lines.push(line);
      }
    }

    return lines;
  }

  async parseLines(line: string, param: any) {
    const logRegex =
      /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)](?: \[(\w+)\])? (.+)$/;
    const match = line.match(logRegex);

    if (match) {
      const [, time, level, category, text] = match;
      if (param.levels) {
        if (!param.levels.includes(level)) return null;
      }

      if (param.searchType == 'category') {
        if (param.searchText != '') {
          if (!category || !category.includes(param.searchText)) {
            return null;
          }
        }
      } else if (param.searchType == 'log') {
        if (param.searchText != '') {
          if (!text.includes(param.searchText)) {
            return null;
          }
        }
      } else if (param.searchType == 'time') {
        if (param.searchText != '') {
          if (!time.includes(param.searchText)) {
            return null;
          }
        }
      }

      return {
        time,
        level,
        category: category ? category : '',
        text,
      };
    }
  }

  async writeAlarmLog(alarmCode: string, alarmDetail: string | undefined, state: boolean){
    try{
      const alarm = await this.getAlarmDetail(alarmCode);
      this.alarmLogRepository.save({
        alarmCode:alarm.alarmCode,
        alarmDetail:alarmDetail,
        state:state
      });
    }catch(error){
      console.error(error);
    }
  }

  async getAlarmDetail(alarmCode: string | number):Promise<AlarmEntity>{
    if(typeof alarmCode !== "string"){
      alarmCode = alarmCode.toString();
    }
    const queryBuilder = this.alarmRepository.createQueryBuilder();
    const result = await queryBuilder.andWhere("alarmCode = :alarmCode",{alarmCode}).getMany();

    if(result.length > 0){
      return result[0];
    }else{
      throw new RpcException(`Not Found alarmCode ${alarmCode}`)
    }
  }

  async getAlarmDetails():Promise<AlarmEntity[]>{
    return this.alarmRepository.createQueryBuilder().getMany();
  }

  async generateAlarmDB(){
    let entity:AlarmEntity;
    entity = {
      alarmCode:'2000',
      operationName:'PROGRAM_START_FAIL',
      alarmDetail:'',
      alarmDescription:'프로그램 시작을 실패했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'2001',
      operationName:'LOCALIZATION_FAIL',
      alarmDetail:'',
      alarmDescription:'초기 위치를 찾지 못했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'2002',
      operationName:'MAP_LOAD_FAIL',
      alarmDetail:'',
      alarmDescription:'지도 가져오기를 실패했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2003',
      operationName:'MAP_NOT_LOAD',
      alarmDetail:'',
      alarmDescription:'지도 데이터가 없습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2004',
      operationName:'MAP_TYPE_FAIL',
      alarmDetail:'',
      alarmDescription:'지도 데이터의 형식이 불일치합니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);


    entity = {
      alarmCode:'2005',
      operationName:'MOVE_PATH_FAIL',
      alarmDetail:'',
      alarmDescription:'경로를 이탈했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2006',
      operationName:'MOVE_LOCAL_FAIL',
      alarmDetail:'',
      alarmDescription:'이동 중 위치를 잃었습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2007',
      operationName:'DOCK_FAIL',
      alarmDetail:'',
      alarmDescription:'도킹에 실패했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2016',
      operationName:'ACS_CONNECT_FAIL',
      alarmDetail:'',
      alarmDescription:'ACS와 연결이 끊어졌습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2018',
      operationName:'MOVE_PATH_EMPTY',
      alarmDetail:'',
      alarmDescription:'경로가 생성되지 않았습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2019',
      operationName:'MOVE_DRIVE_FAIL',
      alarmDetail:'',
      alarmDescription:'드라이버가 시작되지 않았습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2020',
      operationName:'LOCALIZATION_NOT_START',
      alarmDetail:'',
      alarmDescription:'위치추정 모듈이 시작되지 않았습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2021',
      operationName:'MOVE_FAIL',
      alarmDetail:'',
      alarmDescription:'도착 실패했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2024',
      operationName:'ACS_DOCK_COMMAND_UNKNOWN',
      alarmDetail:'',
      alarmDescription:'ACS 도킹 명령이 잘못되었습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'2215',
      operationName:'CHARGE_FAIL',
      alarmDetail:'',
      alarmDescription:'CHARGE명령을 받았지만 수행하지 못했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'3000',
      operationName:'EMS',
      alarmDetail:'',
      alarmDescription:'EMS 버튼이 눌렸습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'3001',
      operationName:'FRONT_BUMPER_CRASH',
      alarmDetail:'',
      alarmDescription:'전면 범퍼에 충돌이 발생했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'3002',
      operationName:'BACK_BUMPER_CRASH',
      alarmDetail:'',
      alarmDescription:'후면 범퍼에 충돌이 발생했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'3004',
      operationName:'FRONT_OBSTACLE_DETECT',
      alarmDetail:'',
      alarmDescription:'전방에 물체가 감지되었습니다.',
      isError: false
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'3005',
      operationName:'MOVE_STOP_OBSTACLE',
      alarmDetail:'',
      alarmDescription:'전방 물체 감지로 이동 불가합니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'3006',
      operationName:'BACK_OBSTACLE_DETECT',
      alarmDetail:'',
      alarmDescription:'후방에 물체가 감지되었습니다.',
      isError: false
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'3007',
      operationName:'MOVE_STOP_OBSTACLE',
      alarmDetail:'',
      alarmDescription:'후방 물체 감지로 이동 불가합니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'4000',
      operationName:'BATTERY_EMPTY',
      alarmDetail:'',
      alarmDescription:'배터리 저전압 이상입니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'4001',
      operationName:'CHARGE_ERROR',
      alarmDetail:'',
      alarmDescription:'배터리 충전 이상입니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'4002',
      operationName:'BATTERY_LOW',
      alarmDetail:'',
      alarmDescription:'배터리 부족으로 충전이 필요합니다.',
      isError: false
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'4003',
      operationName:'BATTERY_VERY_LOW',
      alarmDetail:'',
      alarmDescription:'배터리 방전으로 충전이 필요합니다.',
      isError: false
    }
    await this.alarmRepository.save(entity);
        
    entity = {
      alarmCode:'4500',
      operationName:'MOTOR_CURRENT_HIGH',
      alarmDetail:'',
      alarmDescription:'모터 전류가 너무 높습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
        
    entity = {
      alarmCode:'4505',
      operationName:'TEMPERATURE_HIGH',
      alarmDetail:'',
      alarmDescription:'내부 온도가 높습니다.',
      isError: false
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'4512',
      operationName:'MOTOR_BIG_ERROR',
      alarmDetail:'',
      alarmDescription:'Encoder 위치 편차가 큽니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'4514',
      operationName:'LEFT_MOTOR_ERROR',
      alarmDetail:'',
      alarmDescription:'왼쪽 모터에 이상이 발생했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'4515',
      operationName:'RIGHT_MOTOR_ERROR',
      alarmDetail:'',
      alarmDescription:'오른쪽 모터에 이상이 발생했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'4517',
      operationName:'MOTOR_CONNECT_FAIL',
      alarmDetail:'',
      alarmDescription:'모터가 연결되지 않았습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'5100',
      operationName:'FRONT_LIDAR_CONNECT_FAIL',
      alarmDetail:'',
      alarmDescription:'전방 LiDAR 통신에 문제가 발생했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'5101',
      operationName:'BACK_LIDAR_CONNECT_FAIL',
      alarmDetail:'',
      alarmDescription:'후방 LiDAR 통신에 문제가 발생했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'5103',
      operationName:'LIDAR_CLEAN',
      alarmDetail:'',
      alarmDescription:'라이다 센서에 오염이 감지되었습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
    
    entity = {
      alarmCode:'10000',
      operationName:'SERVER_ERROR',
      alarmDetail:'',
      alarmDescription:'서버에 에러가 발생했습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'10001',
      operationName:'SLAMNAV_CONNECT_FAIL',
      alarmDetail:'',
      alarmDescription:'SLAMNAV가 연결되지 않았습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);

    entity = {
      alarmCode:'10002',
      operationName:'PAYLOAD_EMPTY',
      alarmDetail:'',
      alarmDescription:'명령이 비어있습니다.',
      isError: true
    }
    await this.alarmRepository.save(entity);
  }

  async resetAlarms():Promise<void>{
    try{
      await this.alarmLogRepository.clear();
      return;
    }catch(error){
      httpLogger.error(`[LOG] resetAlarms Error : ${errorToJson(error)}`);
      throw new RpcException(`알람로그를 삭제할 수 없습니다.`) 
    }
  }
  async getAlarmsAll():Promise<AlarmLogEntity[]>{
    try{
      /// 1) alarm 전부 리스트로 추출
      const newAlarms = await this.alarmLogRepository.find({
        order: { time: 'DESC' }, // 최신순 정렬
      });
      console.log(newAlarms)
      /// 2) alarm 리스트 반환
      return newAlarms;
    }catch(error){
      httpLogger.error(`[LOG] getAlarmsAll Error : ${errorToJson(error)}`);
      throw new RpcException(`알람로그를 읽을 수 없습니다.`)
    }
  }

  async getAlarms():Promise<AlarmLogEntity[]>{
    try{
      /// 1) emitFlag가 false인 alarm만 리스트로 추출
      const newAlarms = await this.alarmLogRepository.find({
        where: {emitFlag:false},
        order: { time: 'DESC' }, // 최신순 정렬
      });
      /// 2) alarm 리스트 반환
      return newAlarms;
    }catch(error){
      httpLogger.error(`[LOG] getAlarms Error : ${errorToJson(error)}`);
      throw new RpcException(`알람로그를 읽을 수 없습니다.`)
    }
  }

  async getLastAlarm(alarmCode:string):Promise<AlarmLogEntity | undefined>{
    try{
      const allLogs = await this.alarmLogRepository.find({
        order: { time: 'DESC' }, // 최신순 정렬
        where: {alarmCode: alarmCode}
      });

      const latestLogsByCode = new Map<string, AlarmLogEntity>();

      for (const log of allLogs) {
        if (!latestLogsByCode.has(log.alarmCode)) {
          latestLogsByCode.set(log.alarmCode, log);
        }
      }

      const result = Array.from(latestLogsByCode.values());
      return result[0];
    }catch(error){
      return;
    }
  }
  
  async setAlarmsFlag(list:AlarmLogEntity[]){
    try{
      /// 1) emitFlag를 true로 수정하여 업데이트
      for (const alarm of list) {
        alarm.emitFlag = true;
      }
      await this.alarmLogRepository.save(list);
    }catch(error){
      httpLogger.error(`[LOG] setAlarmsFlag Error : ${errorToJson(error)}`);
      throw new RpcException(`알람로그를 저장할 수 없습니다.`)
    }
  }

  async getAlarms2(param: LogReadDto):Promise<PaginationResponse<AlarmLogEntity>>{
    try{
      const queryBuilder = this.alarmLogRepository.createQueryBuilder();
      const dateStart = new Date(param.startDt);
      const dateEnd = new Date(param.endDt);

      dateStart.setHours(0, 0, 0, 0);
      dateEnd.setHours(23, 59, 59, 999);

      if (param.startDt) {
        queryBuilder.andWhere('time >= :startDt', {
          startDt: dateStart,
        });
      }

      if (param.endDt) {
        queryBuilder.andWhere('time <= :endDt', {
          endDt: dateEnd,
        });
      }

      const logs = await queryBuilder
        .skip(param.getOffset())
        .take(param.getLimit())
        .getMany();

      const count = await queryBuilder.getCount();

      return new PaginationResponse(count, param.getLimit(), logs);
    } catch (error) {
      httpLogger.error(`[LOG] getSystemProcess Error : ${errorToJson(error)}`);
      return;
    }
  }

  async setAlarm(param: AlarmDto){
    try{
      /// 1) param 검사
      if(param.alarmCode === undefined || param.alarmCode === ""){
        throw new RpcException('alarmCode 값이 없습니다.');
      }

      if(param.state === undefined){
        throw new RpcException('state 값이 없습니다.');
      }

      /// 2) AlarmLog에 값 업데이트
      this.alarmLogRepository.save(param);      
    }catch(error){
      httpLogger.error(`[LOG] setAlarm Error : ${errorToJson(error)}`);
      throw new RpcException('알람을 저장할 수 없습니다.');
    }
  }

  async readGeneralLog(dir:string){
    try{
        console.log("readGeneralLog : ", dir);
        if(fs.openSync(dir,"r")){
          const filecontent = fs.readFileSync(dir, "utf-8");
          return filecontent;
        }else{
          throw new RpcException('파일이 없습니다.')
        }
    }catch(error){
        httpLogger.error(`[FILE] readJson: ${dir}, ${errorToJson(error)}`);
        throw new RpcException('로그를 읽을 수 없습니다.');
    }
  }
  async getLogs(
    type: string,
    param: LogReadDto,
  ): Promise<PaginationResponse<any>> {
    try {
      const logPath = '/data/log/' + type;
      const logdata: Array<{
        time: string;
        level: string;
        category: string;
        text: string;
      }> = [];
      const dt = new Date(param.startDt);
      const dateEnd = new Date(param.endDt);
      while (dt <= dateEnd) {
        const filePath =
          logPath + '/' + DateUtil.formatDateYYYYMMDD(dt) + '.log';
        // console.debug(filePath);
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf-8');
          const lines = data.split('\n').filter((line) => line.trim() !== '');
          const BATCH_SIZE = 100000;
          const chunks: string[][] = [];
          for (let i = 0; i < lines.length; i += BATCH_SIZE) {
            chunks.push(lines.slice(i, i + BATCH_SIZE));
          }

          for (const chunk of chunks) {
            for (const line of chunk) {
              const logRegex =
                /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)](?: \[(\w+)\])? (.+)$/;
              const match = line.match(logRegex);

              if (match) {
                const [, time, level, category, text] = match;

                if (param.levels) {
                  if (!param.levels.includes(level)) continue;
                }

                if (param.searchType == 'category') {
                  if (param.searchText != '') {
                    if (!category || !category.includes(param.searchText)) {
                      continue;
                    }
                  }
                } else if (param.searchType == 'log') {
                  if (param.searchText != '') {
                    if (!text.includes(param.searchText)) {
                      continue;
                    }
                  }
                } else if (param.searchType == 'time') {
                  if (param.searchText != '') {
                    if (!time.includes(param.searchText)) {
                      continue;
                    }
                  }
                }
                logdata.push({
                  time,
                  level,
                  category: category ? category : '',
                  text,
                });
              }
            }
          }
        } else {
          httpLogger.debug(`[LOG] getLogs File not found: ${filePath}`);
        }
        dt.setDate(dt.getDate() + 1);
      }

      if (param.sortOption == 'recent') {
        logdata.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
        );
      }

      const count = logdata.length;
      const logs = logdata.slice(
        param.getOffset(),
        param.getLimit() + param.getOffset(),
      );

      return new PaginationResponse(count, param.getLimit(), logs);
    } catch (error) {
      httpLogger.error(`[LOG] getLogs Error : ${errorToJson(error)}`);
    }
  }

  async getSystemProcess(param: LogReadDto) {
    try {
      const queryBuilder = this.systemRepository.createQueryBuilder();
      const dateStart = new Date(param.startDt);
      const dateEnd = new Date(param.endDt);

      dateStart.setHours(0, 0, 0, 0);
      dateEnd.setHours(23, 59, 59, 999);

      if (param.startDt) {
        queryBuilder.andWhere('time >= :startDt', {
          startDt: dateStart,
        });
      }

      if (param.endDt) {
        queryBuilder.andWhere('time <= :endDt', {
          endDt: dateEnd,
        });
      }

      const logs = await queryBuilder.getMany();

      const data = logs.map((log) => ({
        time: log.time,
        slamnav: log.slamnav,
        taskman: log.taskman,
        server: log.server,
        webui: log.webui,
      }));
      return data;
    } catch (error) {
      httpLogger.error(`[LOG] getSystemProcess Error : ${errorToJson(error)}`);
      return;
    }
  }
  async getSystemCpu(param: LogReadDto) {
    try {
      const queryBuilder = this.systemRepository.createQueryBuilder();
      const dateStart = new Date(param.startDt);
      const dateEnd = new Date(param.endDt);

      dateStart.setHours(0, 0, 0, 0);
      dateEnd.setHours(23, 59, 59, 999);

      if (param.startDt) {
        queryBuilder.andWhere('time >= :startDt', {
          startDt: dateStart,
        });
      }

      if (param.endDt) {
        queryBuilder.andWhere('time <= :endDt', {
          endDt: dateEnd,
        });
      }

      const logs = await queryBuilder.getMany();
      const data = logs.map((log) => ({
        time: log.time,
        cpu: log.cpu,
        cpu_cores: log.cpu_cores,
        memory_free: log.memory_free,
        memory_total: log.memory_total,
      }));
      return data;
    } catch (error) {
      httpLogger.error(`[LOG] getSystemCpu Error : ${errorToJson(error)}`);
      return;
    }
  }

  async getStatus(
    type: string,
    param: LogReadDto,
  ): Promise<PaginationResponse<any>> {
    try {
      let queryBuilder;
      if (type == 'status') {
        queryBuilder = this.statusRepository.createQueryBuilder();
      } else if (type == 'system') {
        queryBuilder = this.systemRepository.createQueryBuilder();
      }

      const dateStart = new Date(param.startDt);
      const dateEnd = new Date(param.endDt);

      dateStart.setHours(0, 0, 0, 0);
      dateEnd.setHours(23, 59, 59, 999);

      if (param.startDt) {
        queryBuilder.andWhere('time >= :startDt', {
          startDt: dateStart,
        });
      }

      if (param.endDt) {
        queryBuilder.andWhere('time <= :endDt', {
          endDt: dateEnd,
        });
      }

      const logs = await queryBuilder
        .skip(param.getOffset())
        .take(param.getLimit())
        .getMany();

      const count = await queryBuilder.getCount();

      const sanitizeLogs = logs.map((log) => ({
        ...log,
        time: DateUtil.formatDateYYYYMMbDDsHHcMIcSSZZZ(log.time),
      }));

      return new PaginationResponse(count, param.getLimit(), sanitizeLogs);
    } catch (error) {
      httpLogger.error(`[LOG] getStatus Error : ${errorToJson(error)}`);
      return;
    }
  }

  async readState(state: StatusPayload) {
    if (state.robot_state.charge == undefined) {
      httpLogger.debug(`[LOG] readState undefined: ${JSON.stringify(state)}`);
    }
    if (
      state.robot_state.charge != 'none' &&
      state.robot_state.dock == 'true'
    ) {
      return 'Charging';
    } else {
      if (state.robot_state.power == 'false') {
        return 'Power Off';
      } else if (parseFloat(state.condition.mapping_ratio) > 1) {
        return 'Mapping';
      } else {
        if (
          state.map.map_name == '' ||
          state.robot_state.localization != 'good' ||
          state.motor[0].status != '1' ||
          state.motor[1].status != '1'
        ) {
          return 'Not Ready';
        } else if (state.move_state.obs != 'none') {
          return 'Obstacle';
        } else if (state.move_state.auto_move == 'move') {
          return 'Moving';
        } else if (state.move_state.auto_move == 'pause') {
          return 'Paused';
        } else if (state.move_state.auto_move == 'stop') {
          return 'Ready';
        } else {
          return '?';
        }
      }
    }
  }

  @Cron('0 0 */12 * * *') // 매 12시간마다 실행
  async handleArchiving() {
    httpLogger.info('[LOG] Starting data archiving process...');
    await this.archiveOldDataDay();
    await this.optimizeTable('status');
    httpLogger.info('[LOG] Data archiving and optimization completed.');
  }

  async emitStatusTest(time: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const state = {
          pose: {
            x: '0',
            y: '0',
            rz: '0',
          },
          map: {
            map_name: '',
          },
          vel: {
            vx: '0',
            vy: '0',
            wz: '0',
          },

          imu: {
            acc_x: '0',
            acc_y: '0',
            acc_z: '0',
            gyr_x: '0',
            gyr_y: '0',
            gyr_z: '0',
            imu_rx: '0',
            imu_ry: '0',
            imu_rz: '0',
          },
          goal_node: {
            id: '',
            name: '',
            state: '',
            x: '0',
            y: '0',
            rz: '0',
          },
          cur_node: {
            id: '',
            name: '',
            state: '',
            x: '0',
            y: '0',
            rz: '0',
          },
          motor: [
            {
              connection: 'false',
              status: '0',
              temp: '0',
              current: '0',
            },
            {
              connection: 'false',
              status: '0',
              temp: '0',
              current: '0',
            },
          ],
          lidar: [
            {
              connection: 'false',
              port: '',
              serialnumber: '',
            },
            {
              connection: 'false',
              serialnumber: '',
              port: '',
            },
          ],
          power: {
            bat_in: '0',
            bat_out: '0',
            bat_current: '0',
            power: '0',
            total_power: '0',
            charge_current: '0',
            contact_voltage: '0',
          },
          move_state: {
            auto_move: 'stop',
            dock_move: 'stop',
            jog_move: 'stop',
            obs: 'none',
            path: 'none',
          },
          robot_state: {
            power: 'false',
            dock: 'false',
            emo: 'false',
            charge: 'false',
            localization: 'none', // "none", "busy", "good", "fail"
          },
          condition: {
            inlier_error: '0',
            inlier_ratio: '0',
            mapping_error: '0',
            mapping_ratio: '0',
          },
          setting: {
            platform_type: '',
          },
          time: '',
        };
        httpLogger.debug(`[LOG] emitStatusTest: ${new Date(time)}, ${time}`);
        const newLog: StatusLogEntity = {
          time: new Date(time),
          slam: false,
          type: state.setting.platform_type,
          conditions: {
            inlier_ratio: parseFloat(state.condition.inlier_ratio),
            inlier_error: parseFloat(state.condition.inlier_error),
          },
          move_state: {
            state: await this.readState(state as StatusPayload),
            auto_move: state.move_state.auto_move,
            dock_move: state.move_state.dock_move,
            jog_move: state.move_state.jog_move,
            obs: state.move_state.obs,
            path: state.move_state.path,
          },
          robot_state: {
            charge: state.robot_state.charge,
            dock: state.robot_state.dock,
            localization: state.robot_state.localization,
            power: state.robot_state.power == 'true' ? true : false,
          },
          task: {
            connection: false,
            file: '',
            id: 0,
            running: false,
          },
          map: state.map.map_name,
          imu: {
            acc_x: parseFloat(state.imu.acc_x),
            acc_y: parseFloat(state.imu.acc_y),
            acc_z: parseFloat(state.imu.acc_z),
            gyr_x: parseFloat(state.imu.gyr_y),
            gyr_y: parseFloat(state.imu.gyr_y),
            gyr_z: parseFloat(state.imu.gyr_y),
            imu_rx: parseFloat(state.imu.imu_rx),
            imu_ry: parseFloat(state.imu.imu_ry),
            imu_rz: parseFloat(state.imu.imu_rz),
          },
          motor0: {
            connection: state.motor[0].connection == 'true' ? true : false,
            status: parseInt(state.motor[0].status),
            current: parseFloat(state.motor[0].current),
            temp: parseFloat(state.motor[0].temp),
          },
          motor1: {
            connection: state.motor[1].connection == 'true' ? true : false,
            status: parseInt(state.motor[1].status),
            current: parseFloat(state.motor[1].current),
            temp: parseFloat(state.motor[1].temp),
          },
          power: {
            bat_current: parseFloat(state.power.bat_current),
            bat_in: parseFloat(state.power.bat_in),
            bat_out: parseFloat(state.power.bat_out),
            power: parseFloat(state.power.power),
            total_power: parseFloat(state.power.total_power),
            charge_current: parseFloat(state.power.charge_current),
            contact_voltage: parseFloat(state.power.contact_voltage),
          },
          pose: {
            x: parseFloat(state.pose.x),
            y: parseFloat(state.pose.y),
            rz: parseFloat(state.pose.rz),
            vx: parseFloat(state.vel.vx),
            vy: parseFloat(state.vel.vy),
            wz: parseFloat(state.vel.wz),
          },
        };
        await this.statusRepository.save(newLog);
        resolve(newLog);
      } catch (error) {
        httpLogger.error(`[LOG] emitStatus: ${errorToJson(error)}`);
        reject({
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
          },
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    });
  }

  async emitStatus(state: StatusPayload, slam: boolean, task: TaskPayload) {
    return new Promise(async (resolve, reject) => {
      try {
        const newLog: StatusLogEntity = {
          time: new Date(),
          slam: slam,
          type: state.setting.platform_type,
          conditions: {
            inlier_ratio: parseFloat(state.condition.inlier_ratio),
            inlier_error: parseFloat(state.condition.inlier_error),
          },
          move_state: {
            state: await this.readState(state),
            auto_move: state.move_state.auto_move,
            dock_move: state.move_state.dock_move,
            jog_move: state.move_state.jog_move,
            obs: state.move_state.obs,
            path: state.move_state.path,
          },
          robot_state: {
            charge: state.robot_state.charge,
            dock: state.robot_state.dock,
            localization: state.robot_state.localization,
            power: state.robot_state.power == 'true' ? true : false,
          },
          map: state.map.map_name,
          task: {
            connection: task.connection,
            file: task.file,
            id: task.id,
            running: task.running,
          },
          imu: {
            acc_x: parseFloat(state.imu.acc_x),
            acc_y: parseFloat(state.imu.acc_y),
            acc_z: parseFloat(state.imu.acc_z),
            gyr_x: parseFloat(state.imu.gyr_y),
            gyr_y: parseFloat(state.imu.gyr_y),
            gyr_z: parseFloat(state.imu.gyr_y),
            imu_rx: parseFloat(state.imu.imu_rx),
            imu_ry: parseFloat(state.imu.imu_ry),
            imu_rz: parseFloat(state.imu.imu_rz),
          },
          motor0: {
            connection: state.motor[0].connection == 'true' ? true : false,
            status: parseInt(state.motor[0].status),
            current: parseFloat(state.motor[0].current),
            temp: parseFloat(state.motor[0].temp),
          },
          motor1: {
            connection: state.motor[1].connection == 'true' ? true : false,
            status: parseInt(state.motor[1].status),
            current: parseFloat(state.motor[1].current),
            temp: parseFloat(state.motor[1].temp),
          },
          power: {
            bat_current: parseFloat(state.power.bat_current),
            bat_in: parseFloat(state.power.bat_in),
            bat_out: parseFloat(state.power.bat_out),
            power: parseFloat(state.power.power),
            total_power: parseFloat(state.power.total_power),
            charge_current: parseFloat(state.power.charge_current),
            contact_voltage: parseFloat(state.power.contact_voltage),
          },
          pose: {
            x: parseFloat(state.pose.x),
            y: parseFloat(state.pose.y),
            rz: parseFloat(state.pose.rz),
            vx: parseFloat(state.vel.vx),
            vy: parseFloat(state.vel.vy),
            wz: parseFloat(state.vel.wz),
          },
        };
        await this.statusRepository.save(newLog);
        resolve(newLog);
      } catch (error) {
        httpLogger.error(`[LOG] emitStatus: ${errorToJson(error)}`);
        reject({
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
          },
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }
    });
  }

  async checkTables(name: string, query: string) {
    httpLogger.debug(`checkTables: ${name}`);
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      // 테이블 존재 여부 확인
      const [rows] = await queryRunner.query(`
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = '${name}'
          `);

      const tableExists = rows['COUNT(*)'] > 0;

      if (!tableExists) {
        httpLogger.info(
          `[LOG] checkTable: Table "${name}" does not exist. Creating...`,
        );
        await queryRunner.query(query);
        httpLogger.info(
          `[LOG] checkTable: Table "${name}" created successfully.`,
        );
      } else {
        httpLogger.info(`[LOG] checkTable: Table "${name}" exist.`);
      }
    } catch (error) {
      httpLogger.error(`[LOG] checkTable: ${errorToJson(error)}`);
    }
  }

  async archiveOldDataDay(): Promise<void> {
    //오래전 ~ 1일 전 데이터를 모두 각각 파일 이름으로 저장
    const startDt = await this.getOldestTime();
    httpLogger.debug(`[LOG] archiveOldDataDay: startDt(${startDt})`);
    const dt = startDt;
    const endDt = new Date();
    endDt.setDate(endDt.getDate() - 60);
    endDt.setHours(0, 0, 0, 0);

    while (dt < endDt) {
      await this.archiveOldDBData('status', DateUtil.formatDateYYYYMMDD(dt));
      await this.archiveOldDBData('system', DateUtil.formatDateYYYYMMDD(dt));
      await this.archiveOldJSONData('socket', DateUtil.formatDateYYYYMMDD(dt));
      await this.archiveOldJSONData('http', DateUtil.formatDateYYYYMMDD(dt));
      dt.setDate(dt.getDate() + 1);
      httpLogger.debug(
        `[LOG] archiveOldDataDay: nextDt(${dt}), endDt(${endDt})`,
      );
    }

    httpLogger.debug(`[LOG] archiveOldDataDay: Done`);
    return;
  }

  async getOldestTime() {
    const oldestRecord = await this.statusRepository
      .createQueryBuilder('entity')
      .select('entity.time')
      .orderBy('entity.time', 'ASC') // ASC 정렬로 가장 오래된 항목을 맨 위로
      .getOne(); // 가장 첫 번째 항목 가져오기

    return oldestRecord?.time || null; // 시간이 없으면 null 반환
  }

  async archiveOldDBData(type: string, date: string): Promise<void> {
    const dateStart = new Date(date);
    const dateEnd = new Date(date);

    dateStart.setHours(0, 0, 0, 0);
    dateEnd.setHours(23, 59, 59, 999);

    let oldData;
    // 오래된 데이터 가져오기
    if (type == 'status') {
      oldData = await this.statusRepository
        .createQueryBuilder()
        .where('time >= :dateStart && time <= :dateEnd', { dateStart, dateEnd })
        .getMany();
    } else if (type == 'system') {
      oldData = await this.systemRepository
        .createQueryBuilder()
        .where('time >= :dateStart && time <= :dateEnd', { dateStart, dateEnd })
        .getMany();
    }

    const oldData_time = oldData.map((data) => ({
      ...data,
      time: DateUtil.formatDateYYYYMMbDDsHHcMIcSSZZZ(data.time),
    }));

    if (oldData.length > 0) {
      // 파일 저장 경로 설정
      const archiveDir = path.join('/data/log', 'archive', type);

      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      const fileName = `${moment(date).format('YYYY-MM-DD')}`;
      const filePath = path.join(archiveDir, fileName);
      let jsonData: any[] = [];
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        jsonData = JSON.parse(fileContent);
        if (!Array.isArray(jsonData)) {
          jsonData = [];
        }
      }

      jsonData.push(oldData_time);

      // 데이터를 JSON 파일로 저장
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

      //파일을 압축
      const zip = new AdmZip();
      zip.addLocalFile(filePath);
      zip.writeZip(filePath + '.archive');

      fs.unlink(filePath, (err) => {
        if (err) {
          httpLogger.error(
            `[LOG] ArchiveOldDBData File Unlink : ${filePath}, ${errorToJson(err)}`,
          );
        }
      });

      if (type == 'status') {
        // Original 테이블에서 데이터 삭제
        await this.statusRepository
          .createQueryBuilder()
          .delete()
          .where('time >= :dateStart && time <= :dateEnd', {
            dateStart,
            dateEnd,
          })
          .execute();
      } else if (type == 'system') {
        // Original 테이블에서 데이터 삭제
        await this.systemRepository
          .createQueryBuilder()
          .delete()
          .where('time >= :dateStart && time <= :dateEnd', {
            dateStart,
            dateEnd,
          })
          .execute();
      }

      httpLogger.info(
        `[LOG] ArchiveOldDBData: Archived data saved to ${filePath}`,
      );
    } else {
      httpLogger.info(`[LOG] ArchiveOldDBData: No data to archive`);
    }
  }

  async archiveOldJSONData(type: string, date: string): Promise<void> {
    //파일 존재 확인
    const filePath = '/data/log/' + type + '/' + date + '.log';
    if (fs.existsSync(filePath)) {
      //파일을 압축
      const zipPath = path.join(
        'data',
        'log',
        'archive',
        type,
        date + '.archive',
      );

      const zip = new AdmZip();
      zip.addLocalFile(filePath);
      zip.writeZip(zipPath);

      fs.unlink(filePath, (err) => {
        if (err) {
          httpLogger.error(
            `[LOG] archiveOldJSONData: Archive unlink Error : ${errorToJson(err)}`,
          );
        }
      });

      httpLogger.info(
        `[LOG] archiveOldJSONData: Archived Done ${filePath} -> ${zipPath}`,
      );
    } else {
      httpLogger.debug(`[LOG] archiveOldJSONData: ${date} Log file not found`);
    }
  }

  async optimizeTable(tableName: string) {
    try {
      // 테이블 최적화
      await this.dataSource.query(`OPTIMIZE TABLE ${tableName}`);
      httpLogger.info(
        `[LOG] optimizeTable: Table ${tableName} optimized successfully`,
      );
    } catch (error) {
      httpLogger.error(
        `[LOG] optimizeTable: optimizing table ${tableName}, ${errorToJson(error)}`,
      );
      throw error;
    }
  }

  async getCpuUsage() {
    try {
      // CPU 정보를 가져옴
      const cpuLoad = await si.currentLoad();
      // console.log(cpuLoad);
      const sysUsage: SystemUsagePayload = {
        cpu: cpuLoad.currentLoad,
        total_memory: os.totalmem() / 1024 ** 3,
        free_memory: os.freemem() / 1024 ** 3,
        cpu_cores: [],
      };
      cpuLoad.cpus.map((cpu) => {
        sysUsage.cpu_cores.push(cpu.load);
      });
      // console.log(sysUsage)
      return sysUsage;
    } catch (error) {
      console.error(`[LOG] getCpuUsage: ${JSON.stringify(error)}`);
    }
  }

  async getProcessUsage() {
    try {
      const processUsages = new Map<string, ProcessUsagePayload>();
      const data = execSync('ps aux --sort=-%cpu')
        .toString()
        .split('\n')
        .slice(1);

      // 각 프로세스의 정보를 파싱
      const processes = data.map((line) => {
        const columns = line.trim().split(/\s+/);
        return {
          user: columns[0],
          pid: columns[1],
          cpu: parseFloat(columns[2]), // CPU 사용량 (%)
          mem: parseFloat(columns[3]), // 메모리 사용량 (%)
          vsz: parseInt(columns[4]) / 1024 / 1024, //가상메모리(GB)
          rss: parseInt(columns[5]) / 1024 / 1024, //실제메모리(GB)
          time: columns[8], //실행후지난시간
          command: columns.slice(10).join(' '), // 실행된 명령어
        };
      });

      let serverInfo = { cpu: 0, mem: 0, vsz: 0, rss: 0 };
      let uiInfo = { cpu: 0, mem: 0, vsz: 0, rss: 0 };
      let slamnavInfo = { cpu: 0, mem: 0, vsz: 0, rss: 0 };
      let taskmanInfo = { cpu: 0, mem: 0, vsz: 0, rss: 0 };

      try {
        processes.map((process) => {
          if (
            process.command.includes('web_robot_server') ||
            process.command.includes('nest')
          ) {
            //  console.log("server : ", process);
            serverInfo = {
              cpu: serverInfo.cpu + process.cpu / 8,
              mem: serverInfo.mem + process.mem,
              vsz: serverInfo.vsz + process.vsz,
              rss: serverInfo.rss + process.rss,
            };
          } else if (
            process.command.includes('web_robot_ui') ||
            process.command.includes('next')
          ) {
            // console.log("ui : ", process);
            uiInfo = {
              cpu: uiInfo.cpu + process.cpu / 8,
              mem: uiInfo.mem + process.mem,
              vsz: uiInfo.vsz + process.vsz,
              rss: uiInfo.rss + process.rss,
            };
            // processUsages.set('web_robot_ui',{cpu:process.cpu,mem:process.mem,vsz:process.vsz,rss:process.rss,time:process.time});
          } else if (process.command.includes('TaskMan')) {
            // console.log("TaskMan : ", process);
            taskmanInfo = {
              cpu: taskmanInfo.cpu + process.cpu / 8,
              mem: taskmanInfo.mem + process.mem,
              vsz: taskmanInfo.vsz + process.vsz,
              rss: taskmanInfo.rss + process.rss,
            };
            // processUsages.set('TaskMan',{cpu:process.cpu,mem:process.mem,vsz:process.vsz,rss:process.rss,time:process.time});
          } else if (process.command.includes('SLAMNAV2')) {
            // console.log("SLAMNAV : ", process)
            slamnavInfo = {
              cpu: slamnavInfo.cpu + process.cpu / 8,
              mem: slamnavInfo.mem + process.mem,
              vsz: slamnavInfo.vsz + process.vsz,
              rss: slamnavInfo.rss + process.rss,
            };
            // processUsages.set('SLAMNAV2',{cpu:process.cpu,mem:process.mem,vsz:process.vsz,rss:process.rss,time:process.time});
          } else if (process.command.includes('mediamtx')) {
            // console.log("mediamtx : ", process)
            // processUsages.set('mediamtx',{cpu:process.cpu,mem:process.mem,vsz:process.vsz,rss:process.rss,time:process.time});
          }
        });

        processUsages.set('web_robot_server', serverInfo);
        processUsages.set('web_robot_ui', uiInfo);
        processUsages.set('SLAMNAV2', slamnavInfo);
        processUsages.set('TaskMan', taskmanInfo);
      } catch (error) {
        console.error(error);
      }

      // console.log(processUsages);
      return processUsages;
    } catch (error) {
      console.error(`[LOG] getProcessUsage: ${JSON.stringify(error)}`);
    }
  }

  private previousStats = {};
  private previousTime = new Date();
  async getNetworkUsage() {
    try {
      const networkUsages = new Map<string, NetworkUsagePayload>();
      const data = fs.readFileSync('/proc/net/dev', 'utf8');

      const lines = data.split('\n');
      const interfaces = {};

      // 각 인터페이스의 rx, tx 바이트 추출
      lines.forEach((line) => {
        if (line.includes(':')) {
          const parts = line.split(':');
          const interfaceName = parts[0].trim();
          const stats = parts[1].trim().split(/\s+/);
          const rxPackets = parseInt(stats[1]);
          const txPackets = parseInt(stats[9]);
          const rxDrops = parseInt(stats[3]);
          const txDrops = parseInt(stats[11]);
          const rxErrors = parseInt(stats[2]);
          const txErrors = parseInt(stats[10]);
          const rxKBytes = (parseInt(stats[0], 10) * 8) / 1000;
          const txKBytes = (parseInt(stats[8], 10) * 8) / 1000;

          interfaces[interfaceName] = {
            rxKBytes,
            txKBytes,
            rxPackets,
            txPackets,
            rxDrops,
            txDrops,
            rxErrors,
            txErrors,
          };
        }
      });

      // 변화를 확인하여 비트 전송률 계산
      for (const interfaceName in interfaces) {
        if (this.previousStats[interfaceName]) {
          const rxDiff =
            interfaces[interfaceName].rxKBytes -
            this.previousStats[interfaceName].rxKBytes;
          const txDiff =
            interfaces[interfaceName].txKBytes -
            this.previousStats[interfaceName].txKBytes;

          const timeDiff =
            (new Date().getTime() - this.previousTime.getTime()) / 1000;
          const rxKbps = rxDiff / timeDiff; // 1초 간격으로 계산
          const txKbps = txDiff / timeDiff;
          // console.log(`${interfaceName} rxKbps: ${rxKbps}, ${timeDiff}`)
          // console.log(`${interfaceName} txKbps: ${txKbps}, ${timeDiff}`)
          interfaces[interfaceName] = {
            ...interfaces[interfaceName],
            rxKbps,
            txKbps,
          };
        } else {
          interfaces[interfaceName] = {
            ...interfaces[interfaceName],
            rxKbps: 0,
            txKbps: 0,
          };
        }
        networkUsages.set(interfaceName, interfaces[interfaceName]);
      }
      // 현재 상태 업데이트
      this.previousStats = interfaces;
      this.previousTime = new Date();

      // console.log(networkUsages);
      return networkUsages;
    } catch (error) {
      console.error(error);
    }
  }

  async emitSystem() {
    try {
      const newLog: SystemLogEntity = {
        time: new Date(),
        cpu: this.systemUsage.cpu,
        cpu_cores: this.systemUsage.cpu_cores,
        memory_free: this.systemUsage.free_memory,
        memory_total: this.systemUsage.total_memory,
        network: this.networkUsage,
        slamnav: this.processUsage.get('SLAMNAV2'),
        server: this.processUsage.get('web_robot_server'),
        webui: this.processUsage.get('web_robot_ui'),
        taskman: this.processUsage.get('TaskMan'),
      };
      await this.systemRepository.save(newLog);
    } catch (error) {
      httpLogger.error(`[LOG] emitSystem: ${errorToJson(error)}`);
    }
  }

  async getSystemCurrent() {
    return {
      system: this.systemUsage,
      process: this.processUsage,
      network: this.networkUsage,
    };
  }

  async readMemoryUsage() {
    try {
      if (process.platform.includes('linux')) {
        this.systemUsage = await this.getCpuUsage();
        this.processUsage = await this.getProcessUsage();
        // this.networkUsage = Object.fromEntries(await this.getNetworkUsage());
      }
    } catch (error) {
      httpLogger.error(`[LOG] readMemoryUsage: ${JSON.stringify(error)}`);
    }
  }
}
